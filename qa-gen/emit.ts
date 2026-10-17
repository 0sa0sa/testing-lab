// 展開済みケース表（レビュー用 Markdown）とテストコードを書き出す
import type { Case, Diagnostic, ExpandResult, Spec, Value } from './types.ts';

const fmt = (v: Value | undefined) =>
  v === undefined ? '(なし)' : v === null ? '-' : typeof v === 'boolean' ? (v ? 'Y' : 'N') : String(v);
const esc = (s: string) => s.replace(/\|/g, '\\|');
const group = (c: Case) => c.source.split(' / ')[0];

export function emitCasesMd(spec: Spec, res: ExpandResult, diags: Diagnostic[], srcName: string): string {
  const { cases, summaries } = res;
  const inCols = Object.keys(spec.inputs);
  const outCols = Object.keys(spec.outputs);
  const groups = [...new Set(cases.map(group))];
  const lines = [
    `<!-- 自動生成ファイルです。手で編集しないでください。元: ${srcName} -->`,
    '',
    `# ${spec.feature} — 展開済みテストケース`,
    '',
    `- ケース数: ${cases.length}（${groups.map((g) => `${g} ${cases.filter((c) => group(c) === g).length}`).join('、')}）`,
    `- 層: ${spec.layers.join(', ')}（各層で同じケースを実行します）`,
  ];
  if (inCols.length) lines.push(`- 表に出てこない入力の既定値: ${inCols.map((k) => `${k}=${fmt(spec.base[k])}`).join(', ')}`);
  lines.push('');
  const warnings = diags.filter((d) => d.level === 'warning');
  if (warnings.length) lines.push('## 警告', '', ...warnings.map((w) => `- ${w.line ? `L${w.line}: ` : ''}${w.message}`), '');

  for (const g of groups) {
    const gc = cases.filter((c) => group(c) === g);
    lines.push(`## ${g}`, '');
    if (summaries[g]) lines.push(...summaries[g], '');
    if (gc[0].steps) {
      // 状態遷移: 経路と、最後のイベント後の期待値
      lines.push(`| ID | 種類 | 経路 | ${outCols.map((o) => `=> ${o}`).join(' | ')} | 備考 |`);
      lines.push(`|${Array(4 + outCols.length).fill('---').join('|')}|`);
      for (const c of gc) {
        const steps = c.steps!;
        const head = steps.length - (c.focus ?? 1);
        const path = steps.map((s, i) => (i >= head ? `**${s.event}**` : s.event)).join(' → ');
        lines.push(`| ${esc(c.id)} | ${c.source.split(' / ')[1]} | ${path} | ${outCols.map((o) => fmt(c.expected[o])).join(' | ')} | ${esc(c.note)} |`);
      }
      lines.push('', '太字 = 検査対象のイベント。それより前は初期状態からその状態へ行くための経路で、途中の状態も検査します', '');
      continue;
    }
    lines.push(`| ID | 行 | ${inCols.join(' | ')} | ${outCols.map((o) => `=> ${o}`).join(' | ')} | 備考 |`);
    lines.push(`|${Array(3 + inCols.length + outCols.length).fill('---').join('|')}|`);
    for (const c of gc) {
      const ins = inCols.map((k) => {
        const v = c.input[k];
        const def = spec.inputs[k];
        // 定義どおりの値はそのまま、型や値が外れたもの（同値分割の無効クラス）は JSON で見せる
        const plain =
          (def.type === 'enum' && typeof v === 'string' && def.values.includes(v)) ||
          (def.type === 'bool' && typeof v === 'boolean') ||
          (def.type === 'int' && typeof v === 'number' && Number.isInteger(v));
        const s = !(k in c.input) ? '(なし)' : plain ? fmt(v) : JSON.stringify(v);
        return c.input[k] !== spec.base[k] || !(k in c.input) ? `**${esc(s)}**` : esc(s);
      });
      lines.push(`| ${esc(c.id)} | ${esc(c.source.split(' / ')[1] ?? '')} | ${ins.join(' | ')} | ${outCols.map((o) => fmt(c.expected[o])).join(' | ')} | ${esc(c.note)} |`);
    }
    lines.push('', '太字 = 既定値から変えた入力。(なし) = そのキーを送らない', '');
  }
  return lines.join('\n');
}

export function emitTest(spec: Spec, cases: Case[], bindingImport: string, srcName: string): string {
  const lit = (v: unknown) => JSON.stringify(v);
  const body = cases
    .map((c) => {
      const extra = c.steps ? `, steps: ${lit(c.steps)}` : '';
      return `  { id: ${lit(c.id)}, source: ${lit(c.source)}, input: ${lit(c.input)}, expected: ${lit(c.expected)}${extra} },`;
    })
    .join('\n');
  return `// 自動生成ファイルです。手で編集しないでください。元: ${srcName}
// 再生成: npm run qa:gen
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import binding from ${lit(bindingImport)};

type Expected = Record<string, unknown>;
interface Case {
  id: string;
  source: string;
  input: Record<string, unknown>;
  expected: Expected;
  steps?: { event: string; expected: Expected }[];
}

const cases: Case[] = [
${body}
];

/** 期待値に書かれた出力だけを取り出す。値がない出力は null */
const pick = (actual: Record<string, unknown>, expected: Expected) =>
  Object.fromEntries(Object.keys(expected).map((k) => [k, actual[k] ?? null]));

for (const layer of ${lit(spec.layers)} as const) {
  describe(${lit(spec.feature)} + ' [' + layer + ']', () => {
    const driver = binding[layer];
    before(async () => driver.setup?.());
    after(async () => driver.teardown?.());
    for (const c of cases) {
      test(c.id + '  (' + c.source + ')', async () => {
        if (!c.steps) {
          if (!driver.run) throw new Error('binding の ' + layer + ' に run がありません');
          assert.deepEqual(pick(await driver.run(c.input as never), c.expected), c.expected);
          return;
        }
        if (!driver.start) throw new Error('binding の ' + layer + ' に start がありません');
        const send = await driver.start(c.input as never);
        for (const [i, s] of c.steps.entries()) {
          const actual = pick(await send(s.event), s.expected);
          assert.deepEqual(actual, s.expected, (i + 1) + ' 番目のイベント ' + s.event + ' の結果が違います');
        }
      });
    }
  });
}
`;
}
