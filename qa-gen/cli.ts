// 使い方: node qa-gen/cli.ts [--check] [仕様ファイル or ディレクトリ ...]
//   既定では qa/ 以下の *.qa.md をすべて処理する
//   --check: ファイルを書き換えず、生成物が最新かどうかだけ確かめる（CI 用）
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { parseSpec } from './parse.ts';
import { expand } from './expand.ts';
import { emitCasesMd, emitSummaryMd, emitTest } from './emit.ts';
import type { Diagnostic } from './types.ts';

const args = process.argv.slice(2);
const check = args.includes('--check');
const targets = args.filter((a) => !a.startsWith('--'));
if (targets.length === 0) targets.push('qa');

function collect(p: string): string[] {
  if (statSync(p).isDirectory()) return readdirSync(p).flatMap((f) => collect(join(p, f)));
  return p.endsWith('.qa.md') ? [p] : [];
}

let failed = false;
for (const file of targets.flatMap(collect)) {
  const diags: Diagnostic[] = [];
  const rel = relative(process.cwd(), file);
  const spec = parseSpec(rel, readFileSync(file, 'utf8'), diags);
  const res = diags.some((d) => d.level === 'error') ? { cases: [], summaries: {}, pairwiseInfo: {} } : expand(spec, diags);
  const cases = res.cases;

  for (const d of diags) console.log(`${d.level === 'error' ? 'エラー' : '警告'}  ${rel}${d.line ? `:${d.line}` : ''}  ${d.message}`);
  if (diags.some((d) => d.level === 'error')) { failed = true; continue; }

  const stem = basename(file, '.qa.md');
  const dir = dirname(file);
  const genDir = join(dir, 'generated');
  const bindingPath = resolve(dir, spec.binding);
  if (!existsSync(bindingPath)) { console.log(`エラー  ${rel}  binding が見つかりません: ${spec.binding}`); failed = true; continue; }

  const outputs: [string, string][] = [
    [join(genDir, `${stem}.summary.md`), emitSummaryMd(spec, res, diags, basename(file))],
    [join(genDir, `${stem}.cases.md`), emitCasesMd(spec, res, basename(file))],
    [join(genDir, `${stem}.test.ts`), emitTest(spec, cases, './' + relative(genDir, bindingPath).replace(/^\.\//, ''), basename(file))],
  ];
  for (const [path, content] of outputs) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
    if (current === content) continue;
    if (check) { console.log(`古い    ${relative(process.cwd(), path)}  （npm run qa:gen で再生成してください）`); failed = true; continue; }
    mkdirSync(genDir, { recursive: true });
    writeFileSync(path, content);
    console.log(`生成    ${relative(process.cwd(), path)}`);
  }
  console.log(`OK      ${rel}  ケース ${cases.length} 件`);
}
process.exit(failed ? 1 : 0);
