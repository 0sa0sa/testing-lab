// *.qa.md を読み込み、Spec に変換する
import { parse as parseYaml } from 'yaml';
import type {
  BoundaryTable, DecisionTable, Diagnostic, EquivalenceTable, Expected, InputDef, Literal,
  OutputType, PairwiseTable, Spec, StateMachine, Value,
} from './types.ts';

interface RawTable {
  header: string[];
  rows: { cells: string[]; line: number }[];
}

const NOTE_COLS = new Set(['備考', 'note']);
const MIN_COLS = new Set(['最小', 'min']);
const MAX_COLS = new Set(['最大', 'max']);
const KIND_COLS = new Set(['種別', 'kind']);
const VALUES_COLS = new Set(['値', 'values']);
const LEVELS_COLS = new Set(['水準', 'levels', '値']);
const INPUT_COLS = new Set(['入力', 'input']);
const CLASS_COLS = new Set(['クラス', 'class']);

/** セクション名 → 技法。日本語と英語のどちらでも書ける */
const SECTIONS: Record<string, 'decision' | 'boundary' | 'equivalence' | 'pairwise' | 'state' | 'inputs' | 'outputs'> = {
  decision: 'decision', 'ディシジョンテーブル': 'decision',
  boundary: 'boundary', '境界値': 'boundary',
  equivalence: 'equivalence', '不正な入力': 'equivalence', '同値分割': 'equivalence',
  pairwise: 'pairwise', '組み合わせ': 'pairwise', 'ペアワイズ': 'pairwise',
  state: 'state', '状態遷移': 'state',
  '入力': 'inputs', inputs: 'inputs',
  '出力': 'outputs', outputs: 'outputs',
};
const TYPE_NAMES: Record<string, 'enum' | 'bool' | 'int' | 'string'> = {
  enum: 'enum', '選択': 'enum', bool: 'bool', '真偽': 'bool', int: 'int', '整数': 'int', string: 'string', '文字列': 'string',
};

type Err = (line: number | undefined, msg: string) => void;

export function parseSpec(file: string, text: string, diags: Diagnostic[]): Spec {
  const lines = text.split(/\r?\n/);
  const err: Err = (line, message) => diags.push({ level: 'error', line, message });

  // ---- front matter ----
  if (lines[0] !== '---') throw new Error(`${file}: 先頭に YAML の front matter (---) がありません`);
  const end = lines.indexOf('---', 1);
  if (end < 0) throw new Error(`${file}: front matter の終わり (---) がありません`);
  const fm = parseYaml(lines.slice(1, end).join('\n')) ?? {};

  const inputs: Record<string, InputDef> = { ...(fm.inputs ?? {}) };
  const outputs: Record<string, OutputType> = { ...(fm.outputs ?? {}) };
  const baseRaw: Record<string, unknown> = { ...(fm.base ?? {}) };

  // 「## 入力」「## 出力」の表を先に読む（他の表の列名の検査に使うため）
  for (let j = end + 1; j < lines.length; j++) {
    const h = sectionOf(lines[j]);
    if (!h || (h.kind !== 'inputs' && h.kind !== 'outputs')) continue;
    const t = readTable(lines, j + 1).table;
    if (!t) { err(j + 1, `「${lines[j]}」の下に表がありません`); continue; }
    const col = (names: string[]) => t.header.findIndex((x) => names.includes(x));
    const typeIdx = col(['型', 'type']);
    if (typeIdx < 0) { err(j + 1, '「型」列がありません'); continue; }
    for (const row of t.rows) {
      const name = row.cells[0];
      const type = TYPE_NAMES[row.cells[typeIdx] ?? ''];
      if (!type) { err(row.line, `${name}: 型「${row.cells[typeIdx]}」は使えません（選択 / 真偽 / 整数${h.kind === 'outputs' ? ' / 文字列' : ''}）`); continue; }
      if (h.kind === 'outputs') {
        outputs[name] = type === 'enum' ? 'string' : type;
        continue;
      }
      const valIdx = col(['値', 'values']);
      const defIdx = col(['既定値', 'default']);
      if (type === 'enum') {
        const values = (row.cells[valIdx] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
        if (values.length < 2) err(row.line, `${name}: 選択には「値」列に 2 つ以上の値が必要です`);
        inputs[name] = { type: 'enum', values };
      } else if (type === 'string') {
        err(row.line, `${name}: 入力に文字列型は使えません`);
        continue;
      } else inputs[name] = { type };
      const d = row.cells[defIdx] ?? '';
      if (defIdx < 0 || d === '') { err(row.line, `${name}: 既定値がありません`); continue; }
      baseRaw[name] = type === 'bool' ? parseBool(d) : type === 'int' ? Number(d.replace(/[_,]/g, '')) : d;
    }
  }
  const spec: Spec = {
    file,
    feature: fm.feature ?? file,
    binding: fm.binding,
    layers: fm.layers ?? ['unit'],
    inputs,
    outputs,
    base: {},
    decisionTables: [],
    boundaries: [],
    equivalences: [],
    pairwise: [],
    stateMachines: [],
  };
  if (!spec.binding) err(1, 'front matter に binding がありません');
  for (const [k, v] of Object.entries(baseRaw)) {
    if (!inputs[k]) err(1, `既定値 ${k}: 入力に定義されていません`);
    else spec.base[k] = v as Value;
  }
  for (const k of Object.keys(inputs)) if (!(k in spec.base)) err(1, `${k} の既定値がありません`);
  if (fm.invalid_event) {
    spec.invalidEvent = {};
    for (const [k, v] of Object.entries(fm.invalid_event)) {
      if (!outputs[k]) err(1, `invalid_event.${k}: outputs に定義されていません`);
      else spec.invalidEvent[k] = v as Value;
    }
  }

  // ---- 本文: ## セクションごとに読む ----
  let i = end + 1;
  while (i < lines.length) {
    const h = sectionOf(lines[i]);
    if (!h || h.kind === 'inputs' || h.kind === 'outputs') {
      if (!h && /^##\s+[^:：]+[:：]/.test(lines[i])) err(i + 1, `知らないセクションです: ${lines[i]}（${Object.keys(SECTIONS).join(' / ')}）`);
      i++;
      continue;
    }
    const kind = h.kind;
    const title = h.title;
    const headLine = i + 1;
    i++;
    if (kind === 'state') {
      const r = readMermaid(lines, i, title, headLine, err);
      i = r.next;
      if (r.sm) spec.stateMachines.push(r.sm);
      continue;
    }
    const table = readTable(lines, i);
    i = table.next;
    if (!table.table) { err(headLine, `「${lines[headLine - 1]}」の下に表がありません`); continue; }
    if (kind === 'decision') spec.decisionTables.push(toDecision(title, headLine, table.table, spec, err));
    else if (kind === 'boundary') spec.boundaries.push(toBoundary(title, headLine, table.table, spec, err));
    else if (kind === 'equivalence') spec.equivalences.push(toEquivalence(title, headLine, table.table, spec, err));
    else spec.pairwise.push(toPairwise(title, headLine, table.table, spec, err));
  }
  return spec;
}

/** "## 境界値: subtotal" → { kind: 'boundary', title: 'subtotal' }。題がなければ見出しの語 */
function sectionOf(line: string) {
  const m = line.match(/^##\s+([^:：]+?)\s*(?:[:：]\s*(.+))?$/);
  const kind = m && SECTIONS[m[1]];
  return kind ? { kind, title: (m![2] ?? m![1]).trim() } : undefined;
}

function readTable(lines: string[], from: number): { table?: RawTable; next: number } {
  let i = from;
  while (i < lines.length && !lines[i].trim().startsWith('|')) {
    if (lines[i].startsWith('## ')) return { next: i };
    i++;
  }
  const split = (s: string) => s.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const rows: RawTable['rows'] = [];
  let header: string[] | undefined;
  for (; i < lines.length && lines[i].trim().startsWith('|'); i++) {
    const cells = split(lines[i]);
    if (!header) { header = cells; continue; }
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue; // 区切り行
    rows.push({ cells, line: i + 1 });
  }
  return { table: header ? { header, rows } : undefined, next: i };
}

/** 列見出しを分類する。"=> name" は出力列 */
function classify(header: string[], spec: Spec, line: number, err: Err) {
  const cols = header.map((h, idx) => {
    if (idx === 0) return { kind: 'id' as const, name: h };
    if (NOTE_COLS.has(h)) return { kind: 'note' as const, name: h };
    if (MIN_COLS.has(h)) return { kind: 'min' as const, name: h };
    if (MAX_COLS.has(h)) return { kind: 'max' as const, name: h };
    if (KIND_COLS.has(h)) return { kind: 'valid' as const, name: h };
    if (VALUES_COLS.has(h)) return { kind: 'values' as const, name: h };
    if (INPUT_COLS.has(h)) return { kind: 'input' as const, name: h };
    if (CLASS_COLS.has(h)) return { kind: 'class' as const, name: h };
    const out = h.match(/^=>\s*(\S+)$/);
    if (out) {
      if (!spec.outputs[out[1]]) err(line, `出力列「${h}」: outputs に ${out[1]} がありません`);
      return { kind: 'out' as const, name: out[1] };
    }
    if (!spec.inputs[h]) err(line, `列「${h}」: 「## 入力」に定義されていません（出力なら "=> ${h}" と書きます）`);
    return { kind: 'in' as const, name: h };
  });
  // 書かれていない出力列は、ディシジョンテーブルの答えで補う（補えなければ展開時にエラー）
  return cols;
}
type Cols = ReturnType<typeof classify>;

export function parseOutput(cell: string, type: OutputType | undefined): Value | undefined {
  if (cell === '') return undefined;
  if (cell === '-') return null;
  if (type === 'int') return /^-?\d+$/.test(cell) ? Number(cell) : undefined;
  if (type === 'bool') return parseBool(cell) ?? undefined;
  return cell;
}

export function parseBool(cell: string): boolean | undefined {
  if (['Y', 'y', 'true', '○'].includes(cell)) return true;
  if (['N', 'n', 'false', '×'].includes(cell)) return false;
  return undefined;
}

/**
 * 同値分割の値セルを読む。カンマ区切り。
 *   gold → 文字列 / "" や "3000" → 引用符の中身の文字列 / 1, 1.5 → 数値
 *   true, false, null → そのまま / (なし) → キーを送らない
 */
export function parseLiterals(cell: string): Literal[] | string {
  const tokens: string[] = [];
  let cur = '';
  let quoted = false;
  for (const ch of cell) {
    if (ch === '"') quoted = !quoted;
    if (ch === ',' && !quoted) { tokens.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  tokens.push(cur.trim());
  const out: Literal[] = [];
  for (const t of tokens) {
    if (t === '') return '空の値があります（空文字列は "" と書きます）';
    if (t === '(なし)') out.push({ missing: true });
    else if (t === 'null') out.push({ v: null });
    else if (t === 'true' || t === 'false') out.push({ v: t === 'true' });
    else if (/^-?\d+(\.\d+)?$/.test(t)) out.push({ v: Number(t) });
    else if (/^".*"$/.test(t)) out.push({ v: JSON.parse(t) as string });
    else out.push({ v: t });
  }
  return out;
}

function readExpected(cols: Cols, cells: string[], spec: Spec, line: number, err: Err): Expected {
  const expected: Expected = {};
  cols.forEach((c, idx) => {
    if (c.kind !== 'out') return;
    const cell = cells[idx] ?? '';
    if (cell === '') return; // 空欄 = この表では決めない（ディシジョンテーブルから補う）
    const v = parseOutput(cell, spec.outputs[c.name]);
    if (v === undefined) err(line, `「=> ${c.name}」の値「${cell}」が不正です（値がないなら "-" と書きます）`);
    else expected[c.name] = v;
  });
  return expected;
}

const noteOf = (cols: Cols, cells: string[]) => {
  const idx = cols.findIndex((c) => c.kind === 'note');
  return idx < 0 ? '' : cells[idx] ?? '';
};

function toDecision(name: string, line: number, t: RawTable, spec: Spec, err: Err): DecisionTable {
  const cols = classify(t.header, spec, line, err);
  const conditions = cols.filter((c) => c.kind === 'in').map((c) => c.name);
  const seen = new Set<string>();
  const rules = t.rows.map((r) => {
    const id = r.cells[0];
    if (seen.has(id)) err(r.line, `ルール ID「${id}」が重複しています`);
    seen.add(id);
    const conds: Record<string, string> = {};
    cols.forEach((c, idx) => {
      if (c.kind === 'in') conds[c.name] = r.cells[idx] ?? '';
    });
    return { id, conds, expected: readExpected(cols, r.cells, spec, r.line, err), note: noteOf(cols, r.cells), line: r.line };
  });
  return { name, conditions, rules, line };
}

function toBoundary(input: string, line: number, t: RawTable, spec: Spec, err: Err): BoundaryTable {
  if (spec.inputs[input]?.type !== 'int') err(line, `boundary: ${input} は int の入力ではありません`);
  const cols = classify(t.header, spec, line, err);
  if (!cols.some((c) => c.kind === 'min') || !cols.some((c) => c.kind === 'max')) err(line, '境界値表には「最小」「最大」列が必要です');
  if (cols.some((c) => c.kind === 'in')) err(line, '境界値表に入力列は書けません（他の入力は base の値を使います）');
  const num = (s: string, l: number) => {
    if (s === '') return undefined;
    if (!/^-?\d+$/.test(s.replace(/_/g, ''))) { err(l, `数値ではありません: ${s}`); return undefined; }
    return Number(s.replace(/_/g, ''));
  };
  const partitions = t.rows.map((r) => {
    const p: BoundaryTable['partitions'][number] = {
      name: r.cells[0], expected: readExpected(cols, r.cells, spec, r.line, err), note: noteOf(cols, r.cells), line: r.line,
    };
    cols.forEach((c, idx) => {
      if (c.kind === 'min') p.min = num(r.cells[idx] ?? '', r.line);
      if (c.kind === 'max') p.max = num(r.cells[idx] ?? '', r.line);
    });
    return p;
  });
  return { input, partitions, line };
}

/**
 * 同値分割（不正な入力）の表。
 *   | 入力 | クラス | 値 | => error | ... |   「入力」列で入力ごとに行を分ける
 *   「種別」列（有効/無効）は省略でき、省略すると無効
 *   旧形式「## equivalence: member」（入力列なし）は題を入力名として扱う
 */
function toEquivalence(name: string, line: number, t: RawTable, spec: Spec, err: Err): EquivalenceTable {
  const cols = classify(t.header, spec, line, err);
  const inIdx = t.header.findIndex((h) => INPUT_COLS.has(h));
  const classCol = t.header.findIndex((h, i) => i > 0 && CLASS_COLS.has(h));
  const classIdx = classCol >= 0 ? classCol : 0;
  const kindIdx = cols.findIndex((c) => c.kind === 'valid');
  const valIdx = cols.findIndex((c) => c.kind === 'values');
  // 入力列があれば先頭列（id）がクラス名、なければ先頭列がクラス名で入力は題
  if (inIdx < 0 && !spec.inputs[name]) err(line, `「入力」列がありません（または見出しを「## 同値分割: <入力名>」にします）`);
  if (valIdx < 0) { err(line, '「値」列がありません'); return { name, classes: [], line }; }
  if (cols.some((c) => c.kind === 'in')) err(line, '不正な入力の表に入力名の列は書けません（他の入力は既定値を使います）');
  const classes = t.rows.map((r) => {
    const input = inIdx >= 0 ? r.cells[inIdx] ?? '' : name;
    if (!spec.inputs[input]) err(r.line, `入力「${input}」は定義されていません`);
    const kind = kindIdx >= 0 ? r.cells[kindIdx] ?? '' : '無効';
    const valid = ['有効', 'valid'].includes(kind);
    if (!valid && !['無効', 'invalid'].includes(kind)) err(r.line, `種別「${kind}」: 有効 か 無効 と書きます`);
    const values = parseLiterals(r.cells[valIdx] ?? '');
    if (typeof values === 'string') err(r.line, `値: ${values}`);
    const className = r.cells[classIdx] ?? '';
    return {
      input, name: className, valid, values: typeof values === 'string' ? [] : values,
      expected: readExpected(cols, r.cells, spec, r.line, err), note: noteOf(cols, r.cells), line: r.line,
    };
  });
  return { name, classes, line };
}

function toPairwise(name: string, line: number, t: RawTable, spec: Spec, err: Err): PairwiseTable {
  const lvIdx = t.header.findIndex((h) => LEVELS_COLS.has(h));
  if (lvIdx < 0) { err(line, '組み合わせの表には「値」（水準）列が必要です'); return { name, factors: [], line }; }
  const factors = t.rows.map((r) => {
    const input = r.cells[0];
    if (!spec.inputs[input]) err(r.line, `因子「${input}」: inputs に定義されていません`);
    return { input, levels: r.cells[lvIdx] ?? '', line: r.line };
  });
  if (factors.length < 2) err(line, 'ペアワイズには因子が 2 つ以上必要です');
  if (new Set(factors.map((f) => f.input)).size !== factors.length) err(line, '因子が重複しています');
  return { name, factors, line };
}

/** "## state: 名前 (1-switch)" の下の ```mermaid stateDiagram を読む */
function readMermaid(lines: string[], from: number, title: string, line: number, err: Err): { sm?: StateMachine; next: number } {
  const m = title.match(/^(.*?)\s*\((\d+)-switch\)\s*$/);
  const sm: StateMachine = {
    name: m ? m[1] : title, switches: m ? Number(m[2]) : 0,
    states: [], labels: {}, events: [], transitions: [], line,
  };
  let i = from;
  while (i < lines.length && lines[i].trim() !== '```mermaid') {
    if (lines[i].startsWith('## ')) { err(line, `「## state: ${title}」の下に \`\`\`mermaid のブロックがありません`); return { next: i }; }
    i++;
  }
  if (i >= lines.length) { err(line, `「## state: ${title}」の下に \`\`\`mermaid のブロックがありません`); return { next: i }; }
  const addState = (s: string) => { if (!sm.states.includes(s)) sm.states.push(s); };
  for (i++; i < lines.length && lines[i].trim() !== '```'; i++) {
    const s = lines[i].trim();
    const ln = i + 1;
    let r: RegExpMatchArray | null;
    if (s === '' || s.startsWith('%%') || /^stateDiagram(-v2)?$/.test(s) || /^direction\s/.test(s)) continue;
    if ((r = s.match(/^\[\*\]\s*-->\s*(\w+)$/))) {
      if (sm.initial) err(ln, '初期状態（[*] --> X）が 2 つあります');
      sm.initial = r[1];
      addState(r[1]);
    } else if ((r = s.match(/^(\w+)\s*-->\s*\[\*\]$/))) {
      addState(r[1]);
    } else if ((r = s.match(/^(\w+)\s*-->\s*(\w+)\s*:\s*(\S+)$/))) {
      sm.transitions.push({ from: r[1], to: r[2], event: r[3], line: ln });
      addState(r[1]); addState(r[2]);
      if (!sm.events.includes(r[3])) sm.events.push(r[3]);
    } else if ((r = s.match(/^(\w+)\s*-->\s*(\w+)$/))) {
      err(ln, `遷移にイベント名がありません: ${s}（"A --> B: event" と書きます）`);
    } else if ((r = s.match(/^(\w+)\s*:\s*(.+)$/))) {
      sm.labels[r[1]] = r[2].trim();
      addState(r[1]);
    } else {
      err(ln, `解釈できない行です: ${s}`);
    }
  }
  return { sm, next: i + 1 };
}
