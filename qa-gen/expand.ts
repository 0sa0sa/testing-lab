// Spec を具体的なテストケースに展開し、表の矛盾・漏れを検査する
import { parseBool } from './parse.ts';
import type { BoundaryTable, Case, DecisionTable, Diagnostic, Expected, Partition, Spec, Value } from './types.ts';

/** 入力 1 つ分の「値の領域」。int は境界値表の区間名を値として扱う */
interface Domain {
  values: string[]; // セルに書ける値
  toValue: (v: string) => Value; // 代表値（実際に投げる値）
  ofValue: (v: Value) => string | undefined; // 実値 → 領域の値
}

function domains(spec: Spec, diags: Diagnostic[]): Record<string, Domain> {
  const out: Record<string, Domain> = {};
  for (const [name, def] of Object.entries(spec.inputs)) {
    if (def.type === 'enum') {
      out[name] = { values: def.values, toValue: (v) => v, ofValue: (v) => (def.values.includes(String(v)) ? String(v) : undefined) };
    } else if (def.type === 'bool') {
      out[name] = { values: ['Y', 'N'], toValue: (v) => v === 'Y', ofValue: (v) => (v ? 'Y' : 'N') };
    } else {
      const bt = spec.boundaries.find((b) => b.input === name);
      if (!bt) continue; // 境界値表がない int はディシジョンテーブルで使えない
      const parts = bt.partitions;
      out[name] = {
        values: parts.map((p) => p.name),
        toValue: (v) => representative(parts.find((p) => p.name === v)!),
        ofValue: (v) => parts.find((p) => (p.min === undefined || Number(v) >= p.min) && (p.max === undefined || Number(v) <= p.max))?.name,
      };
    }
  }
  void diags;
  return out;
}

/** 区間の代表値: 両端があれば中央、片側だけならその端 */
function representative(p: Partition): number {
  if (p.min !== undefined && p.max !== undefined) return Math.floor((p.min + p.max) / 2);
  return (p.min ?? p.max)!;
}

/** セル → そのルールが受け付ける値の集合 */
function cellSet(cell: string, dom: Domain, line: number, col: string, diags: Diagnostic[]): string[] {
  if (cell === '-') return dom.values;
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

const sameExpected = (a: Expected, b: Expected) => JSON.stringify(a) === JSON.stringify(b);
const fmtExpected = (e: Expected) => Object.entries(e).map(([k, v]) => `${k}=${v ?? '-'}`).join(', ');

interface DTIndex {
  table: DecisionTable;
  /** 条件の組み合わせ（"a|b|c"）→ 該当ルール */
  lookup: Map<string, DecisionTable['rules'][number][]>;
}

function checkDecision(spec: Spec, dt: DecisionTable, dom: Record<string, Domain>, diags: Diagnostic[]): DTIndex {
  const lookup = new Map<string, DecisionTable['rules']>();
  for (const c of dt.conditions) {
    if (!dom[c]) diags.push({ level: 'error', line: dt.line, message: `条件「${c}」: int の入力をディシジョンテーブルで使うには「## boundary: ${c}」が必要です` });
  }
  if (dt.conditions.some((c) => !dom[c])) return { table: dt, lookup };

  for (const r of dt.rules) {
    const sets = dt.conditions.map((c) => cellSet(r.conds[c], dom[c], r.line, c, diags));
    for (const combo of product(sets)) {
      const key = combo.join('|');
      lookup.set(key, [...(lookup.get(key) ?? []), r]);
    }
  }
  // 網羅性と矛盾の検査
  for (const combo of product(dt.conditions.map((c) => dom[c].values))) {
    const key = combo.join('|');
    const label = dt.conditions.map((c, i) => `${c}=${combo[i]}`).join(', ');
    const hits = lookup.get(key) ?? [];
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
  void spec;
  return { table: dt, lookup };
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

export function expand(spec: Spec, diags: Diagnostic[]): Case[] {
  spec.boundaries.forEach((b) => checkBoundary(b, diags));
  const dom = domains(spec, diags);
  const indexes = spec.decisionTables.map((dt) => checkDecision(spec, dt, dom, diags));
  const cases: Case[] = [];

  // ディシジョンテーブル: "-" や複数値は全組み合わせに展開する（「関係ない」ことも検査する）
  for (const { table: dt } of indexes) {
    if (dt.conditions.some((c) => !dom[c])) continue;
    for (const r of dt.rules) {
      const sets = dt.conditions.map((c) => cellSet(r.conds[c], dom[c], r.line, c, []));
      const combos = product(sets);
      for (const combo of combos) {
        const input: Record<string, Value> = { ...spec.base };
        dt.conditions.forEach((c, i) => (input[c] = dom[c].toValue(combo[i])));
        cases.push({
          id: combos.length === 1 ? r.id : `${r.id}[${combo.join(',')}]`,
          source: `decision: ${dt.name} / ${r.id}`,
          input,
          expected: r.expected,
          note: r.note,
        });
      }
    }
  }

  // 境界値: 各区間の両端（2 値境界値分析）
  for (const bt of spec.boundaries) {
    for (const p of bt.partitions) {
      const edges = [...new Set([p.min, p.max].filter((v): v is number => v !== undefined))];
      for (const v of edges) {
        cases.push({
          id: `${bt.input}=${v}`,
          source: `boundary: ${bt.input} / ${p.name}`,
          input: { ...spec.base, [bt.input]: v },
          expected: p.expected,
          note: p.note,
        });
      }
    }
  }

  // 表どうしの突き合わせ: 境界値のケースもディシジョンテーブルの答えと一致するか
  for (const c of cases) {
    for (const { table: dt, lookup } of indexes) {
      if (c.source.startsWith(`decision: ${dt.name} `)) continue;
      const combo = dt.conditions.map((k) => dom[k]?.ofValue(c.input[k]));
      if (combo.some((v) => v === undefined)) continue;
      const rule = lookup.get(combo.join('|'))?.[0];
      if (rule && !sameExpected(rule.expected, c.expected)) {
        diags.push({
          level: 'error',
          message: `ケース ${c.id}（${c.source}）の期待値 ${fmtExpected(c.expected)} が、「${dt.name}」の ${rule.id}（${fmtExpected(rule.expected)}）と食い違います`,
        });
      }
    }
  }

  const ids = new Set<string>();
  for (const c of cases) {
    if (ids.has(c.id)) diags.push({ level: 'error', message: `ケース ID「${c.id}」が重複しています` });
    ids.add(c.id);
  }
  return cases;
}
