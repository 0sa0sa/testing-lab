// 展開済みケース表（レビュー用 Markdown）とテストコードを書き出す
import type { Case, Diagnostic, Spec, Value } from './types.ts';

const HEADER = '<!-- 自動生成ファイルです。手で編集しないでください。元: {src} -->';

const fmt = (v: Value | null | undefined) => (v === null || v === undefined ? '-' : typeof v === 'boolean' ? (v ? 'Y' : 'N') : String(v));

export function emitCasesMd(spec: Spec, cases: Case[], diags: Diagnostic[], srcName: string): string {
  const inCols = Object.keys(spec.inputs);
  const outCols = Object.keys(spec.outputs);
  const esc = (s: string) => s.replace(/\|/g, '\\|');
  const lines = [
    HEADER.replace('{src}', srcName),
    '',
    `# ${spec.feature} — 展開済みテストケース`,
    '',
    `- ケース数: ${cases.length}（${summary(cases)}）`,
    `- 層: ${spec.layers.join(', ')}（各層で同じケースを実行します）`,
    `- 表に出てこない入力の既定値: ${inCols.map((k) => `${k}=${fmt(spec.base[k])}`).join(', ')}`,
    '',
  ];
  const warnings = diags.filter((d) => d.level === 'warning');
  if (warnings.length) {
    lines.push('## 警告', '', ...warnings.map((w) => `- ${w.line ? `L${w.line}: ` : ''}${w.message}`), '');
  }
  lines.push('## ケース一覧', '');
  lines.push(`| ID | 由来 | ${inCols.join(' | ')} | ${outCols.map((o) => `=> ${o}`).join(' | ')} | 備考 |`);
  lines.push(`|${Array(3 + inCols.length + outCols.length).fill('---').join('|')}|`);
  for (const c of cases) {
    // 既定値のままの入力は薄く見せたいが Markdown では無理なので、変えた値だけ太字にする
    const ins = inCols.map((k) => {
      const s = fmt(c.input[k]);
      return c.input[k] !== spec.base[k] ? `**${s}**` : s;
    });
    lines.push(`| ${c.id} | ${esc(c.source)} | ${ins.join(' | ')} | ${outCols.map((o) => fmt(c.expected[o])).join(' | ')} | ${esc(c.note)} |`);
  }
  lines.push('', '太字 = そのケースで既定値から変えた入力', '');
  return lines.join('\n');
}

function summary(cases: Case[]): string {
  const by = new Map<string, number>();
  for (const c of cases) {
    const k = c.source.split(':')[0];
    by.set(k, (by.get(k) ?? 0) + 1);
  }
  return [...by].map(([k, n]) => `${k} ${n}`).join(', ');
}

export function emitTest(spec: Spec, cases: Case[], bindingImport: string, srcName: string): string {
  const lit = (v: unknown) => JSON.stringify(v);
  const body = cases
    .map((c) => `  { id: ${lit(c.id)}, source: ${lit(c.source)}, input: ${lit(c.input)}, expected: ${lit(c.expected)} },`)
    .join('\n');
  return `// 自動生成ファイルです。手で編集しないでください。元: ${srcName}
// 再生成: npm run qa:gen
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import binding from ${lit(bindingImport)};

const cases = [
${body}
];

for (const layer of ${lit(spec.layers)} as const) {
  describe(${lit(spec.feature)} + ' [' + layer + ']', () => {
    const driver = binding[layer];
    before(async () => driver.setup?.());
    after(async () => driver.teardown?.());
    for (const c of cases) {
      test(c.id + '  (' + c.source + ')', async () => {
        const actual = await driver.run(c.input);
        const picked = Object.fromEntries(Object.keys(c.expected).map((k) => [k, actual[k] ?? null]));
        assert.deepEqual(picked, c.expected);
      });
    }
  });
}
`;
}
