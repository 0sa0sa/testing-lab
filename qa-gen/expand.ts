// Spec を具体的なテストケースに展開し、表の矛盾・漏れを検査する
import { parseBool } from './parse.ts';
import type {
  BoundaryTable, Case, DecisionTable, Diagnostic, EquivalenceTable, ExpandResult, Expected,
  PairwiseTable, Partition, Spec, StateMachine, Step, Transition, Value,
} from './types.ts';

/** 入力 1 つ分の「値の領域」。int は境界値表の区間名を値として扱う */
interface Domain {
  values: string[]; // セルに書ける値
  toValue: (v: string) => Value; // 代表値（実際に投げる値）
  ofValue: (v: Value | undefined) => string | undefined; // 実値 → 領域の値（領域外なら undefined）
}

function domains(spec: Spec): Record<string, Domain> {
  const out: Record<string, Domain> = {};
  for (const [name, def] of Object.entries(spec.inputs)) {
    if (def.type === 'enum') {
      out[name] = { values: def.values, toValue: (v) => v, ofValue: (v) => (typeof v === 'string' && def.values.includes(v) ? v : undefined) };
    } else if (def.type === 'bool') {
      out[name] = { values: ['Y', 'N'], toValue: (v) => v === 'Y', ofValue: (v) => (typeof v === 'boolean' ? (v ? 'Y' : 'N') : undefined) };
    } else {
      const bt = spec.boundaries.find((b) => b.input === name);
      if (!bt) continue; // 境界値表がない int はディシジョンテーブルやペアワイズで使えない
      const parts = bt.partitions;
      out[name] = {
        values: parts.map((p) => p.name),
        toValue: (v) => representative(parts.find((p) => p.name === v)!),
        ofValue: (v) =>
          typeof v === 'number' && Number.isInteger(v)
            ? parts.find((p) => (p.min === undefined || v >= p.min) && (p.max === undefined || v <= p.max))?.name
            : undefined,
      };
    }
  }
  return out;
}

/** 区間の代表値: 両端があれば中央、片側だけならその端 */
function representative(p: Partition): number {
  if (p.min !== undefined && p.max !== undefined) return Math.floor((p.min + p.max) / 2);
  return (p.min ?? p.max)!;
}

/** セル → 受け付ける値の集合。"-" は全部 */
function cellSet(cell: string, dom: Domain, line: number, col: string, diags: Diagnostic[]): string[] {
  if (cell === '-' || cell === 'すべて') return dom.values;
  const vals = cell.split(',').map((s) => s.trim()).map((s) => {
    const b = parseBool(s);
    return b === undefined ? s : b ? 'Y' : 'N';
  });
  for (const v of vals) {
    if (!dom.values.includes(v)) diags.push({ level: 'error', line, message: `${col}: 「${v}」は使えません（使える値: ${dom.values.join(', ')}, -）` });
  }
  return vals;
}

function product(lists: string[][]): string[][] {
  return lists.reduce<string[][]>((acc, l) => acc.flatMap((a) => l.map((v) => [...a, v])), [[]]);
}

const same = (a: Value | undefined, b: Value | undefined) => a === b;
const fmtExpected = (e: Expected) => Object.entries(e).map(([k, v]) => `${k}=${v ?? '-'}`).join(', ');
const sameExpected = (a: Expected, b: Expected) =>
  Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((k) => k in b && same(a[k], b[k]));

interface DTIndex {
  table: DecisionTable;
  /** 条件の組み合わせ（"a|b|c"）→ 該当ルール */
  lookup: Map<string, DecisionTable['rules']>;
  usable: boolean;
}

// ---------------------------------------------------------------- 検査

function checkDecision(dt: DecisionTable, dom: Record<string, Domain>, diags: Diagnostic[]): DTIndex {
  const lookup = new Map<string, DecisionTable['rules']>();
  for (const c of dt.conditions) {
    if (!dom[c]) diags.push({ level: 'error', line: dt.line, message: `条件「${c}」: int の入力をディシジョンテーブルで使うには「## boundary: ${c}」が必要です` });
  }
  if (dt.conditions.some((c) => !dom[c])) return { table: dt, lookup, usable: false };

  for (const r of dt.rules) {
    if (Object.keys(r.expected).length === 0) diags.push({ level: 'error', line: r.line, message: `ルール ${r.id}: 出力列（=> ...）がありません` });
    for (const combo of product(dt.conditions.map((c) => cellSet(r.conds[c], dom[c], r.line, c, diags)))) {
      const key = combo.join('|');
      lookup.set(key, [...(lookup.get(key) ?? []), r]);
    }
  }
  // 網羅性と矛盾の検査
  for (const combo of product(dt.conditions.map((c) => dom[c].values))) {
    const label = dt.conditions.map((c, i) => `${c}=${combo[i]}`).join(', ');
    const hits = lookup.get(combo.join('|')) ?? [];
    if (hits.length === 0) {
      diags.push({ level: 'error', line: dt.line, message: `「${dt.name}」: どのルールにも当たらない組み合わせがあります: ${label}` });
    } else if (hits.length > 1) {
      const ids = hits.map((h) => h.id).join(', ');
      const conflict = hits.some((h) => !sameExpected(h.expected, hits[0].expected));
      diags.push({
        level: conflict ? 'error' : 'warning',
        line: hits[1].line,
        message: conflict
          ? `「${dt.name}」: ルール ${ids} が重なり、期待値が食い違います: ${label}`
          : `「${dt.name}」: ルール ${ids} が重なっています（期待値は同じ）: ${label}`,
      });
    }
  }
  return { table: dt, lookup, usable: true };
}

function checkBoundary(bt: BoundaryTable, diags: Diagnostic[]) {
  const ps = bt.partitions;
  ps.forEach((p, i) => {
    if (p.min !== undefined && p.max !== undefined && p.min > p.max) diags.push({ level: 'error', line: p.line, message: `区間「${p.name}」: 最小 > 最大 です` });
    if (i > 0 && p.min === undefined) diags.push({ level: 'error', line: p.line, message: `区間「${p.name}」: 最小が空にできるのは最初の区間だけです` });
    if (i < ps.length - 1 && p.max === undefined) diags.push({ level: 'error', line: p.line, message: `区間「${p.name}」: 最大が空にできるのは最後の区間だけです` });
    const prev = ps[i - 1];
    if (prev?.max !== undefined && p.min !== undefined) {
      if (p.min <= prev.max) diags.push({ level: 'error', line: p.line, message: `区間「${prev.name}」と「${p.name}」が重なっています（${prev.max} と ${p.min}）` });
      else if (p.min > prev.max + 1) diags.push({ level: 'error', line: p.line, message: `区間「${prev.name}」と「${p.name}」の間に隙間があります（${prev.max + 1}〜${p.min - 1}）` });
    }
  });
  if (ps[0]?.min !== undefined) diags.push({ level: 'warning', line: ps[0].line, message: `boundary ${bt.input}: 最初の区間に最小があります。それより小さい値（範囲外）は検査されません` });
  const last = ps[ps.length - 1];
  if (last?.max !== undefined) diags.push({ level: 'warning', line: last.line, message: `boundary ${bt.input}: 最後の区間に最大があります。それより大きい値（範囲外）は検査されません` });
}

function checkEquivalence(spec: Spec, et: EquivalenceTable, dom: Record<string, Domain>, diags: Diagnostic[]) {
  const seen = new Map<string, string>();
  for (const c of et.classes) {
    const def = spec.inputs[c.input];
    if (!def) continue;
    const isValid = (v: Value) =>
      def.type === 'enum' ? typeof v === 'string' && def.values.includes(v)
      : def.type === 'bool' ? typeof v === 'boolean'
      : typeof v === 'number' && Number.isInteger(v);
    if (c.values.length === 0) diags.push({ level: 'error', line: c.line, message: `${c.input}「${c.name}」: 値がありません` });
    for (const lit of c.values) {
      const key = `${c.input} ${JSON.stringify(lit)}`;
      if (seen.has(key)) diags.push({ level: 'error', line: c.line, message: `${c.input} の値 ${'v' in lit ? JSON.stringify(lit.v) : '(なし)'} が「${seen.get(key)}」と「${c.name}」の両方にあります` });
      seen.set(key, c.name);
      const ok = 'v' in lit && isValid(lit.v);
      if (c.valid && !ok) diags.push({ level: 'error', line: c.line, message: `${c.input}「${c.name}」は有効ですが、値 ${'v' in lit ? JSON.stringify(lit.v) : '(なし)'} は型（${def.type}）に合いません` });
      if (!c.valid && ok && def.type !== 'int') diags.push({ level: 'error', line: c.line, message: `${c.input}「${c.name}」の値 ${JSON.stringify((lit as { v: Value }).v)} は正しい値です（不正な入力の表には書けません）` });
    }
  }
  // enum を有効クラスで扱うなら、全値を一度は使う
  for (const input of new Set(et.classes.filter((c) => c.valid).map((c) => c.input))) {
    const def = spec.inputs[input];
    if (def?.type !== 'enum') continue;
    const used = new Set(et.classes.filter((c) => c.valid && c.input === input).flatMap((c) => c.values.map((l) => ('v' in l ? l.v : undefined))));
    const unused = def.values.filter((v) => !used.has(v));
    if (unused.length) diags.push({ level: 'error', line: et.line, message: `${input}: 有効クラスで使われていない値があります: ${unused.join(', ')}` });
  }
  // 不正な入力の表に出てこない入力（int 以外）は警告
  for (const [name, def] of Object.entries(spec.inputs)) {
    if (!et.classes.some((c) => c.input === name && !c.valid)) diags.push({ level: 'warning', line: et.line, message: `「${et.name}」: ${name}（${def.type}）の不正な値が書かれていません` });
  }
  void dom;
}

// ---------------------------------------------------------------- ペアワイズ

/** 貪欲法: 全組み合わせの候補から、未カバーのペアを最も多く埋める行を順に選ぶ（決定的） */
export function pairwise(levels: string[][]): { rows: string[][]; pairs: number; full: number } {
  const n = levels.length;
  const full = levels.reduce((a, l) => a * l.length, 1);
  const uncovered = new Set<string>();
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (const a of levels[i]) for (const b of levels[j]) uncovered.add(`${i}=${a}|${j}=${b}`);
  const pairs = uncovered.size;
  const pairsOf = (row: string[]) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push(`${i}=${row[i]}|${j}=${row[j]}`);
    return out;
  };
  const candidates = product(levels);
  const rows: string[][] = [];
  while (uncovered.size > 0) {
    let best = candidates[0];
    let bestScore = -1;
    for (const c of candidates) {
      const s = pairsOf(c).filter((p) => uncovered.has(p)).length;
      if (s > bestScore) { best = c; bestScore = s; }
    }
    rows.push(best);
    for (const p of pairsOf(best)) uncovered.delete(p);
  }
  return { rows, pairs, full };
}

// ---------------------------------------------------------------- 状態遷移

function checkStateMachine(spec: Spec, sm: StateMachine, diags: Diagnostic[]): boolean {
  const before = diags.filter((d) => d.level === 'error').length;
  const e = (line: number, message: string) => diags.push({ level: 'error', line, message });
  if (!sm.initial) e(sm.line, `「${sm.name}」: 初期状態（[*] --> X）がありません`);
  if (!spec.outputs.state) e(sm.line, '状態遷移を使うには outputs に state が必要です');
  if (!spec.invalidEvent) e(sm.line, '状態遷移を使うには front matter に invalid_event（無効なイベントを送ったときの期待値）が必要です');
  const seen = new Map<string, Transition>();
  for (const t of sm.transitions) {
    const k = `${t.from}|${t.event}`;
    if (seen.has(k)) e(t.line, `状態 ${t.from} でイベント ${t.event} の遷移先が 2 つあります（${seen.get(k)!.to} と ${t.to}）`);
    seen.set(k, t);
  }
  if (sm.initial) {
    const reach = paths(sm);
    for (const s of sm.states) if (!reach.has(s)) e(sm.line, `「${sm.name}」: 状態 ${s} に初期状態から到達できません`);
  }
  if (sm.switches > 2) diags.push({ level: 'warning', line: sm.line, message: `${sm.switches}-switch はケースが急増します` });
  return diags.filter((d) => d.level === 'error').length === before;
}

/** 初期状態から各状態への最短経路（遷移の列） */
function paths(sm: StateMachine): Map<string, Transition[]> {
  const out = new Map<string, Transition[]>([[sm.initial!, []]]);
  const queue = [sm.initial!];
  while (queue.length) {
    const s = queue.shift()!;
    for (const t of sm.transitions) {
      if (t.from === s && !out.has(t.to)) { out.set(t.to, [...out.get(s)!, t]); queue.push(t.to); }
    }
  }
  return out;
}

function stateCases(spec: Spec, sm: StateMachine): Case[] {
  const reach = paths(sm);
  const ok = (t: Transition): Step => ({ event: t.event, expected: normalize(spec, { state: t.to, error: null }) });
  const cases: Case[] = [];

  // N スイッチ網羅: 長さ N+1 の連続した遷移の列をすべて
  let seqs: Transition[][] = sm.transitions.map((t) => [t]);
  for (let k = 0; k < sm.switches; k++) {
    seqs = seqs.flatMap((s) => sm.transitions.filter((t) => t.from === s[s.length - 1].to).map((t) => [...s, t]));
  }
  for (const seq of seqs) {
    const prefix = reach.get(seq[0].from)!;
    const steps = [...prefix, ...seq].map(ok);
    cases.push({
      id: `${seq[0].from}` + seq.map((t) => ` -${t.event}-> ${t.to}`).join(''),
      source: `state: ${sm.name} / 有効遷移`,
      input: { ...spec.base },
      steps,
      focus: seq.length,
      expected: steps[steps.length - 1].expected,
      note: seq.map((t) => sm.labels[t.to]).filter(Boolean).join(' → '),
      line: seq[seq.length - 1].line,
    });
  }

  // 無効遷移: 遷移が定義されていない（状態, イベント）の組をすべて
  for (const s of sm.states) {
    for (const ev of sm.events) {
      if (sm.transitions.some((t) => t.from === s && t.event === ev)) continue;
      const expected = normalize(spec, { ...spec.invalidEvent, state: s });
      const steps = [...reach.get(s)!.map(ok), { event: ev, expected }];
      cases.push({
        id: `${s} ×${ev}`,
        source: `state: ${sm.name} / 無効遷移`,
        input: { ...spec.base },
        steps,
        focus: 1,
        expected,
        note: sm.labels[s] ? `${sm.labels[s]}では ${ev} できない` : '',
        line: sm.line,
      });
    }
  }
  return cases;
}

/** 期待値を outputs の順に並べ、書かれていない出力は null（存在しない）にする */
function normalize(spec: Spec, e: Expected): Expected {
  return Object.fromEntries(Object.keys(spec.outputs).map((k) => [k, e[k] ?? null]));
}

/** 状態遷移表（状態 × イベント）を Markdown で返す */
function stateMatrix(sm: StateMachine): string[] {
  const label = (s: string) => (sm.labels[s] ? `${s}（${sm.labels[s]}）` : s);
  const lines = [
    `| 状態 \\ イベント | ${sm.events.join(' | ')} |`,
    `|${Array(sm.events.length + 1).fill('---').join('|')}|`,
  ];
  for (const s of sm.states) {
    const cells = sm.events.map((ev) => sm.transitions.find((t) => t.from === s && t.event === ev)?.to ?? '×');
    lines.push(`| ${s === sm.initial ? '▶ ' : ''}${label(s)} | ${cells.join(' | ')} |`);
  }
  lines.push('', '▶ = 初期状態、× = できない操作（状態は変わらず、エラーになる）');
  return lines;
}

// ---------------------------------------------------------------- 展開

export function expand(spec: Spec, diags: Diagnostic[]): ExpandResult {
  spec.boundaries.forEach((b) => checkBoundary(b, diags));
  const dom = domains(spec);
  const indexes = spec.decisionTables.map((dt) => checkDecision(dt, dom, diags));
  spec.equivalences.forEach((et) => checkEquivalence(spec, et, dom, diags));
  const cases: Case[] = [];
  const summaries: Record<string, string[]> = {};
  /** 無効クラスのケース。ディシジョンテーブルの領域外なので突き合わせない */
  const outOfDomain = new Set<Case>();

  // ディシジョンテーブル: "-" や複数値は全組み合わせに展開する（「関係ない」ことも検査する）
  for (const { table: dt, usable } of indexes) {
    if (!usable) continue;
    for (const r of dt.rules) {
      const combos = product(dt.conditions.map((c) => cellSet(r.conds[c], dom[c], r.line, c, [])));
      for (const combo of combos) {
        const input: Record<string, Value> = { ...spec.base };
        dt.conditions.forEach((c, i) => (input[c] = dom[c].toValue(combo[i])));
        cases.push({
          id: combos.length === 1 ? r.id : `${r.id}[${combo.join(',')}]`,
          source: `decision: ${dt.name} / ${r.id}`,
          input, expected: { ...r.expected }, note: r.note, line: r.line,
        });
      }
    }
  }

  // 境界値: 各区間の両端（2 値境界値分析）
  //   既定値のままのケースに加えて、その区間を含むディシジョンテーブルの各ルールの条件でも端点を流す
  //   （例: 代引のときだけ効くしきい値は、payment=cod の端点がないと検出できない）
  for (const bt of spec.boundaries) {
    for (const p of bt.partitions) {
      for (const v of new Set([p.min, p.max].filter((v): v is number => v !== undefined))) {
        const seen = new Set<string>();
        const push = (id: string, input: Record<string, Value>, note: string) => {
          const key = JSON.stringify(input);
          if (seen.has(key)) return;
          seen.add(key);
          cases.push({ id, source: `boundary: ${bt.input} / ${p.name}`, input, expected: { ...p.expected }, note, line: p.line });
        };
        push(`${bt.input}=${v}`, { ...spec.base, [bt.input]: v }, p.note);
        for (const { table: dt, usable } of indexes) {
          if (!usable || !dt.conditions.includes(bt.input)) continue;
          for (const r of dt.rules) {
            if (!cellSet(r.conds[bt.input], dom[bt.input], r.line, bt.input, []).includes(p.name)) continue;
            const input: Record<string, Value> = { ...spec.base, [bt.input]: v };
            for (const c of dt.conditions) {
              if (c === bt.input) continue;
              const vals = cellSet(r.conds[c], dom[c], r.line, c, []);
              // 既定値がルールの条件に入っていればそのまま、入っていなければ先頭の値
              const baseLevel = dom[c].ofValue(spec.base[c]);
              input[c] = dom[c].toValue(baseLevel !== undefined && vals.includes(baseLevel) ? baseLevel : vals[0]);
            }
            push(`${bt.input}=${v}/${r.id}`, input, [p.note, `${dt.name} ${r.id} の条件で`].filter(Boolean).join('、'));
          }
        }
      }
    }
  }

  // 同値分割: クラスごとに、書かれた値をすべて 1 ケースずつ
  for (const et of spec.equivalences) {
    for (const c of et.classes) {
      for (const lit of c.values) {
        const input: Record<string, Value> = { ...spec.base };
        let shown: string;
        if ('missing' in lit) { delete input[c.input]; shown = '(なし)'; } else { input[c.input] = lit.v; shown = JSON.stringify(lit.v); }
        const kase: Case = {
          id: `${c.input}:${c.name}=${shown}`,
          source: `equivalence: ${et.name} / ${c.input} ${c.name}`,
          input, expected: { ...c.expected }, note: c.note, line: c.line,
        };
        if (!c.valid) {
          // 無効クラス: 書かれていない出力は「存在しない」
          for (const k of Object.keys(spec.outputs)) if (!(k in kase.expected)) kase.expected[k] = null;
          outOfDomain.add(kase);
        }
        cases.push(kase);
      }
    }
  }

  // ペアワイズ: 期待値はディシジョンテーブルから引く
  for (const pt of spec.pairwise) {
    let ok = true;
    const levels = pt.factors.map((f) => {
      if (!dom[f.input]) {
        diags.push({ level: 'error', line: f.line, message: `因子「${f.input}」: int の入力をペアワイズで使うには「## boundary: ${f.input}」が必要です` });
        ok = false;
        return [];
      }
      const before = diags.length;
      const vals = cellSet(f.levels, dom[f.input], f.line, f.input, diags);
      if (diags.length > before) ok = false;
      if (vals.length < 2) diags.push({ level: 'warning', line: f.line, message: `因子「${f.input}」の水準が 1 つだけです` });
      return vals;
    });
    if (!ok) continue;
    const full = levels.reduce((a, l) => a * l.length, 1);
    if (full > 100_000) { diags.push({ level: 'error', line: pt.line, message: `「${pt.name}」: 全組み合わせが ${full} 件で多すぎます（上限 100000）` }); continue; }
    const res = pairwise(levels);
    res.rows.forEach((row, i) => {
      const input: Record<string, Value> = { ...spec.base };
      pt.factors.forEach((f, j) => (input[f.input] = dom[f.input].toValue(row[j])));
      cases.push({
        id: `P${String(i + 1).padStart(2, '0')}`,
        source: `pairwise: ${pt.name}`,
        input, expected: {}, note: pt.factors.map((f, j) => `${f.input}=${row[j]}`).join(', '), line: pt.line,
      });
    });
    summaries[`pairwise: ${pt.name}`] = [
      `${pt.factors.map((f, j) => `${f.input}（${levels[j].join('/')}）`).join(' × ')} の全 ${res.full} 通りを ${res.rows.length} 件に絞りました。`,
      `どの 2 つの入力を選んでも、値の組 ${res.pairs} 組がすべて一度は出てきます。期待値はディシジョンテーブルから引いています。`,
    ];
  }

  // 表どうしの突き合わせと、期待値の補完
  //   - 同じ出力について、ディシジョンテーブルと他の表の答えが食い違えばエラー
  //   - その表に書かれていない出力は、ディシジョンテーブルの答えで埋める
  for (const c of cases) {
    if (outOfDomain.has(c)) continue;
    for (const { table: dt, lookup, usable } of indexes) {
      if (!usable) continue;
      const combo = dt.conditions.map((k) => dom[k].ofValue(c.input[k]));
      if (combo.some((v) => v === undefined)) continue;
      const rule = lookup.get(combo.join('|'))?.[0];
      if (!rule) continue;
      for (const [k, v] of Object.entries(rule.expected)) {
        if (!(k in c.expected)) c.expected[k] = v;
        else if (!same(c.expected[k], v)) {
          diags.push({
            level: 'error', line: c.line,
            message: `ケース ${c.id}（${c.source}）の ${k}=${c.expected[k] ?? '-'} が、「${dt.name}」の ${rule.id}（${fmtExpected(rule.expected)}）と食い違います`,
          });
        }
      }
    }
  }
  for (const c of cases) {
    const missing = Object.keys(spec.outputs).filter((k) => !(k in c.expected));
    if (missing.length) diags.push({ level: 'error', line: c.line, message: `ケース ${c.id}（${c.source}）: ${missing.join(', ')} の期待値を決める表がありません` });
    c.expected = normalize(spec, c.expected);
  }

  // 状態遷移
  for (const sm of spec.stateMachines) {
    if (!checkStateMachine(spec, sm, diags)) continue;
    const sc = stateCases(spec, sm);
    cases.push(...sc);
    const valid = sc.filter((c) => c.source.endsWith('有効遷移')).length;
    summaries[`state: ${sm.name}`] = [
      ...stateMatrix(sm),
      '',
      `連続 ${sm.switches + 1} 回の有効な遷移 ${valid} 件と、× の操作 ${sc.length - valid} 件を検査します（${sm.switches}-switch 網羅）。各ケースは初期状態から最短の操作でたどり、途中の状態もすべて確かめます。`,
    ];
  }

  const ids = new Set<string>();
  for (const c of cases) {
    if (ids.has(c.id)) diags.push({ level: 'error', line: c.line, message: `ケース ID「${c.id}」が重複しています` });
    ids.add(c.id);
  }
  return { cases, summaries };
}
