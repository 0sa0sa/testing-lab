// 生成物を書き出す
//   summary.md  人が読む要約（表ごとのケース数、警告、組み合わせの結果、状態遷移表）
//   cases.md    差分確認用の一覧（1 ケース 1 行。通読はしない）
//   *.test.ts   テストコード
import type { Case, Diagnostic, ExpandResult, Spec, Value } from './types.ts';

const fmt = (v: Value | undefined) =>
  v === undefined ? '(なし)' : v === null ? '-' : typeof v === 'boolean' ? (v ? 'Y' : 'N') : String(v);
const esc = (s: string) => s.replace(/\|/g, '\\|');
const group = (c: Case) => c.source.split(' / ')[0];

const TECHNIQUE: Record<string, string> = {
  decision: 'ディシジョンテーブル',
  boundary: '境界値',
  equivalence: '不正な入力',
  pairwise: '組み合わせ',
  state: '状態遷移',
};
const HOW: Record<string, string> = {
  decision: '「-」と複数値を全組み合わせに展開',
  boundary: '各区間の両端。区間を使うルールの条件でも流す',
  equivalence: '書いた値ごとに 1 件',
  pairwise: '2 つの入力の組をすべて含む最小に近い組み合わせ',
  state: '有効な遷移の列と、できない操作のすべて',
};
const groupTitle = (g: string) => {
  const [kind, name] = g.split(': ');
  const t = TECHNIQUE[kind] ?? kind;
  return name === t ? t : `${t}: ${name}`;
};

/** 入力の表示。型どおりの値はそのまま、外れた値（不正な入力）は JSON で */
function showInput(spec: Spec, k: string, c: Case): string {
  if (!(k in c.input)) return '(なし)';
  const v = c.input[k];
  const def = spec.inputs[k];
  const plain =
    (def.type === 'enum' && typeof v === 'string' && def.values.includes(v)) ||
    (def.type === 'bool' && typeof v === 'boolean') ||
    (def.type === 'int' && typeof v === 'number' && Number.isInteger(v));
  return plain ? fmt(v) : JSON.stringify(v);
}

/** 既定値から変えた入力だけを「k=v」で並べる */
function changedInputs(spec: Spec, c: Case): string {
  const parts = Object.keys(spec.inputs)
    .filter((k) => !(k in c.input) || c.input[k] !== spec.base[k])
    .map((k) => `${k}=${showInput(spec, k, c)}`);
  return parts.length ? parts.join(', ') : '（既定値のまま）';
}

/** 期待値を「k=v」で並べる。「-」（出力なし）は省く */
function showExpected(c: Case | { expected: Case['expected'] }): string {
  const parts = Object.entries(c.expected).filter(([, v]) => v !== null).map(([k, v]) => `${k}=${fmt(v)}`);
  return parts.length ? parts.join(', ') : '（出力なし）';
}

const header = (srcName: string, what: string) => [`<!-- 自動生成ファイルです。手で編集しないでください。元: ${srcName}（${what}） -->`, ''];

export function emitSummaryMd(spec: Spec, res: ExpandResult, diags: Diagnostic[], srcName: string): string {
  const { cases, summaries } = res;
  const groups = [...new Set(cases.map(group))];
  const lines = [
    ...header(srcName, '人が読む要約'),
    `# ${spec.feature} — テストの要約`,
    '',
    `${cases.length} ケースを ${spec.layers.join(' と ')} の各層で実行します（計 ${cases.length * spec.layers.length} 件）。`,
    '',
    '| 表 | ケース | 作り方 |',
    '|---|--:|---|',
    ...groups.map((g) => `| ${esc(groupTitle(g))} | ${cases.filter((c) => group(c) === g).length} | ${HOW[g.split(':')[0]] ?? ''} |`),
    '',
  ];
  const warnings = diags.filter((d) => d.level === 'warning');
  if (warnings.length) lines.push('## 警告', '', ...warnings.map((w) => `- ${w.line ? `${srcName}:${w.line} ` : ''}${w.message}`), '');

  for (const g of groups) {
    const gc = cases.filter((c) => group(c) === g);
    const kind = g.split(':')[0];
    if (kind === 'pairwise') {
      lines.push(`## ${groupTitle(g)}`, '', ...(summaries[g] ?? []), '');
      const factors = Object.keys(spec.inputs).filter((k) => gc.some((c) => c.input[k] !== spec.base[k]));
      const info = res.pairwiseInfo[g];
      lines.push(`| # | ${factors.join(' | ')} | 新しく満たした組 | 期待値 |`, `|${Array(factors.length + 3).fill('---').join('|')}|`);
      gc.forEach((c, k) => {
        // 区間名（有料 など）と、実際に送る代表値を併記する
        const shown = factors.map((k2) => {
          const level = c.note.split(', ').find((s) => s.startsWith(`${k2}=`))?.slice(k2.length + 1);
          const v = esc(showInput(spec, k2, c));
          return level && level !== v && spec.inputs[k2].type === 'int' ? `${level}（${v}）` : v;
        });
        lines.push(`| ${c.id} | ${shown.join(' | ')} | ${info?.gains[k] ?? ''} | ${esc(showExpected(c))} |`);
      });
      lines.push('', '整数の入力は区間名と、実際に送る代表値（区間の中央）を書いています。期待値はディシジョンテーブルから引いています。', '');
      if (info) lines.push(...info.details, '');
    } else if (kind === 'state') {
      lines.push(`## ${groupTitle(g)}`, '', ...(summaries[g] ?? []), '');
    }
  }
  lines.push('---', '', `全ケースの一覧は ${srcName.replace(/\.qa\.md$/, '.cases.md')} にあります（差分確認用。通読は不要です）。`, '');
  return lines.join('\n');
}

export function emitCasesMd(spec: Spec, res: ExpandResult, srcName: string): string {
  const { cases } = res;
  const groups = [...new Set(cases.map(group))];
  const lines = [
    ...header(srcName, '差分確認用'),
    `# ${spec.feature} — 全ケース一覧`,
    '',
    '> 仕様を変えたときに、どのケースが増えた・減った・変わったかを PR の差分で確かめるためのファイルです。通読は不要です。要約は summary.md を見てください。',
    '',
  ];
  if (Object.keys(spec.inputs).length) {
    lines.push(`既定値: ${Object.keys(spec.inputs).map((k) => `${k}=${fmt(spec.base[k])}`).join(', ')}。各行には既定値から変えた入力だけを書きます。`, '');
  }
  for (const g of groups) {
    const gc = cases.filter((c) => group(c) === g);
    lines.push(`## ${groupTitle(g)}（${gc.length}）`, '');
    if (gc[0].steps) {
      lines.push('| ID | 操作 | 期待値 |', '|---|---|---|');
      for (const c of gc) {
        const steps = c.steps!;
        const head = steps.length - (c.focus ?? 1);
        const path = steps.map((s, i) => (i >= head ? `**${s.event}**` : s.event)).join(' → ');
        lines.push(`| ${esc(c.id)} | ${path} | ${esc(showExpected(c))} |`);
      }
      lines.push('', '太字 = 検査するイベント。その前はそこへ行くための操作で、途中の状態も検査します', '');
      continue;
    }
    lines.push('| ID | 入力 | 期待値 |', '|---|---|---|');
    for (const c of gc) lines.push(`| ${esc(c.id)} | ${esc(changedInputs(spec, c))} | ${esc(showExpected(c))} |`);
    lines.push('');
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
