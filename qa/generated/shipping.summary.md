<!-- 自動生成ファイルです。手で編集しないでください。元: shipping.qa.md（人が読む要約） -->

# 送料計算 — テストの要約

90 ケースを unit と http の各層で実行します（計 180 件）。

| 表 | ケース | 作り方 |
|---|--:|---|
| ディシジョンテーブル: 送料 | 20 | 「-」と複数値を全組み合わせに展開 |
| ディシジョンテーブル: 手数料 | 15 | 「-」と複数値を全組み合わせに展開 |
| 境界値: subtotal | 26 | 各区間の両端。区間を使うルールの条件でも流す |
| 不正な入力 | 20 | 書いた値ごとに 1 件 |
| 組み合わせ: 有効な入力 | 9 | 2 つの入力の組をすべて含む最小に近い組み合わせ |

## 組み合わせ: 有効な入力

member（gold/regular） × island（Y/N） × subtotal（有料/無料/高額） × payment（card/konbini/cod） の全 36 通りを 9 件に絞りました。
どの 2 つの入力を選んでも、値の組 37 組がすべて一度は出てきます。期待値はディシジョンテーブルから引いています。

| # | member | island | subtotal | payment | 期待値 |
|---|---|---|---|---|---|
| P01 | gold | Y | 2500 | card | shipping=0, fee=0 |
| P02 | gold | N | 7499 | konbini | shipping=0, fee=0 |
| P03 | regular | Y | 7499 | cod | shipping=1000, fee=330 |
| P04 | regular | N | 55000 | card | shipping=0, fee=0 |
| P05 | gold | Y | 55000 | konbini | shipping=0, fee=0 |
| P06 | gold | N | 2500 | cod | shipping=0, fee=330 |
| P07 | regular | Y | 2500 | konbini | shipping=1500, fee=0 |
| P08 | gold | Y | 7499 | card | shipping=0, fee=0 |
| P09 | gold | Y | 55000 | cod | shipping=0, fee=0 |

---

全ケースの一覧は shipping.cases.md にあります（差分確認用。通読は不要です）。
