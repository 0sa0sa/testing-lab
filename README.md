# testing-lab: Markdown の表からテストを生成する QA DSL（試作）

人が書いてレビューするのは `qa/*.qa.md` だけです。テストコードは自動生成します。

```
qa/shipping.qa.md          人が書く仕様（境界値表とディシジョンテーブル）
qa/shipping.binding.ts     入出力と実際の呼び出し方の対応。機能ごとに 1 回だけ書く
qa/generated/*.cases.md    自動生成。展開済みケース表（これもレビューする）
qa/generated/*.test.ts     自動生成。node:test のテスト
qa-gen/                    生成器（parse → expand/検査 → emit）
src/                       デモアプリ（送料計算の関数と POST /shipping-fee）
```

## コマンド

- `npm run qa:gen`    仕様の検査とファイル生成
- `npm run qa:check`  生成物が最新かを確認する（CI 用。ファイルは書き換えない）
- `npm test`          生成したテストを unit と http の両方で実行する
- `npm run typecheck`

## 書き方

- front matter: `inputs`（enum / bool / int）、`outputs`、`base`（表に出てこない入力の既定値）、`layers`、`binding`
- `## boundary: <int入力>`: 区間ごとに「最小」「最大」と期待値を書く。各区間の両端がケースになる
- `## decision: <名前>`: 列が入力、`=> 名前` の列が出力。セルには `-`（どの値でもよい）と `a,b`（複数値）が書ける
  - int の入力は、境界値表の区間名で条件を書く
  - `-` は全組み合わせに展開して、本当に関係ないことも検査する

## 生成器が止める誤り

- 境界値表の区間の隙間や重なり
- ディシジョンテーブルの漏れ（どのルールにも当たらない組み合わせ）
- ルールの重なりで期待値が食い違う場合
- 境界値表とディシジョンテーブルの期待値の食い違い
- 未定義の列名や値、出力列の不足
