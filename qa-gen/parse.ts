// *.qa.md を読み込み、Spec に変換する
import { parse as parseYaml } from 'yaml';
import type { BoundaryTable, DecisionTable, Diagnostic, Expected, InputDef, OutputType, Spec, Value } from './types.ts';

interface RawTable {
  header: string[];
  rows: { cells: string[]; line: number }[];
}

const NOTE_COLS = new Set(['備考', 'note']);
const MIN_COLS = new Set(['最小', 'min']);
const MAX_COLS = new Set(['最大', 'max']);

export function parseSpec(file: string, text: string, diags: Diagnostic[]): Spec {
  const lines = text.split(/\r?\n/);
  const err = (line: number | undefined, message: string) => diags.push({ level: 'error', line, message });

  // ---- front matter ----
  if (lines[0] !== '---') throw new Error(`${file}: 先頭に YAML の front matter (---) がありません`);
  const end = lines.indexOf('---', 1);
  if (end < 0) throw new Error(`${file}: front matter の終わり (---) がありません`);
  const fm = parseYaml(lines.slice(1, end).join('\n')) ?? {};

  const inputs: Record<string, InputDef> = fm.inputs ?? {};
  const outputs: Record<string, OutputType> = fm.outputs ?? {};
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
  };
  if (!spec.binding) err(1, 'front matter に binding がありません');
  for (const [k, v] of Object.entries(fm.base ?? {})) {
    if (!inputs[k]) err(1, `base.${k}: inputs に定義されていません`);
    else spec.base[k] = v as Value;
  }
  for (const k of Object.keys(inputs)) if (!(k in spec.base)) err(1, `base に ${k} の既定値がありません`);

  // ---- 本文: ## セクションごとに表を読む ----
  let i = end + 1;
  while (i < lines.length) {
    const h = lines[i].match(/^##\s+(decision|boundary)\s*:\s*(.+)$/);
    if (!h) { i++; continue; }
    const headLine = i + 1;
    i++;
    const table = readTable(lines, i);
    i = table.next;
    if (!table.table) { err(headLine, `「${lines[headLine - 1]}」の下に表がありません`); continue; }
    if (h[1] === 'decision') spec.decisionTables.push(toDecision(h[2].trim(), headLine, table.table, spec, err));
    else spec.boundaries.push(toBoundary(h[2].trim(), headLine, table.table, spec, err));
  }
  return spec;
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

type Err = (line: number | undefined, msg: string) => void;

/** 列見出しを分類する。"=> name" は出力列 */
function classify(header: string[], spec: Spec, line: number, err: Err) {
  const cols = header.map((h, idx) => {
    if (idx === 0) return { kind: 'id' as const, name: h };
    if (NOTE_COLS.has(h)) return { kind: 'note' as const, name: h };
    if (MIN_COLS.has(h)) return { kind: 'min' as const, name: h };
    if (MAX_COLS.has(h)) return { kind: 'max' as const, name: h };
    const out = h.match(/^=>\s*(\S+)$/);
    if (out) {
      if (!spec.outputs[out[1]]) err(line, `出力列「${h}」: outputs に ${out[1]} がありません`);
      return { kind: 'out' as const, name: out[1] };
    }
    if (!spec.inputs[h]) err(line, `列「${h}」: inputs に定義されていません（出力なら "=> ${h}" と書きます）`);
    return { kind: 'in' as const, name: h };
  });
  for (const o of Object.keys(spec.outputs)) {
    if (!cols.some((c) => c.kind === 'out' && c.name === o)) err(line, `出力列「=> ${o}」がありません`);
  }
  return cols;
}

export function parseOutput(cell: string, type: OutputType | undefined): Value | null | undefined {
  if (cell === '') return undefined;
  if (cell === '-') return null;
  if (type === 'int') return Number.isInteger(Number(cell)) ? Number(cell) : undefined;
  if (type === 'bool') return parseBool(cell);
  return cell;
}

export function parseBool(cell: string): boolean | undefined {
  if (['Y', 'y', 'true', '○'].includes(cell)) return true;
  if (['N', 'n', 'false', '×'].includes(cell)) return false;
  return undefined;
}

function readExpected(cols: ReturnType<typeof classify>, cells: string[], spec: Spec, line: number, err: Err): Expected {
  const expected: Expected = {};
  cols.forEach((c, idx) => {
    if (c.kind !== 'out') return;
    const v = parseOutput(cells[idx] ?? '', spec.outputs[c.name]);
    if (v === undefined) err(line, `「=> ${c.name}」の値「${cells[idx] ?? ''}」が不正です（値がないなら "-" と書きます）`);
    else expected[c.name] = v;
  });
  return expected;
}

function toDecision(name: string, line: number, t: RawTable, spec: Spec, err: Err): DecisionTable {
  const cols = classify(t.header, spec, line, err);
  const conditions = cols.filter((c) => c.kind === 'in').map((c) => c.name);
  const seen = new Set<string>();
  const rules = t.rows.map((r) => {
    const id = r.cells[0];
    if (seen.has(id)) err(r.line, `ルール ID「${id}」が重複しています`);
    seen.add(id);
    const conds: Record<string, string> = {};
    let note = '';
    cols.forEach((c, idx) => {
      if (c.kind === 'in') conds[c.name] = r.cells[idx] ?? '';
      if (c.kind === 'note') note = r.cells[idx] ?? '';
    });
    return { id, conds, expected: readExpected(cols, r.cells, spec, r.line, err), note, line: r.line };
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
    const p = { name: r.cells[0], expected: readExpected(cols, r.cells, spec, r.line, err), note: '', line: r.line } as BoundaryTable['partitions'][number];
    cols.forEach((c, idx) => {
      if (c.kind === 'min') p.min = num(r.cells[idx] ?? '', r.line);
      if (c.kind === 'max') p.max = num(r.cells[idx] ?? '', r.line);
      if (c.kind === 'note') p.note = r.cells[idx] ?? '';
    });
    return p;
  });
  return { input, partitions, line };
}
