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

member（gold/regular） × island（Y/N） × subtotal（有料/無料/高額） × payment（card/konbini/cod） の全 36 通りのうち、9 件だけを実行します。

### なぜこの件数で足りるか

1. 目標: どの 2 つの入力を選んでも、その値の組がすべて一度は出てくること（ペアワイズ）。不具合の多くは 1 つの入力か 2 つの入力の組み合わせで起きる、という経験則に基づきます。
2. 満たすべき組は member × island が 4 組、member × subtotal が 6 組、member × payment が 6 組、island × subtotal が 6 組、island × payment が 6 組、subtotal × payment が 9 組で、合計 37 組です。
3. 入力が 4 個あるので、1 件のケースで 6 組を同時に満たせます。全組み合わせを実行すると、同じ組を何度も確かめることになります。
4. 最低件数: subtotal × payment の 9 組は、1 件で 1 組しか満たせません。したがって最低 9 件は必要です。
5. 今回は 9 件で、この最低件数と同じです。これより少ない件数では満たせません。
6. 選び方: 全 36 通りの中から、まだ満たしていない組を最も多く満たすものを 1 件ずつ選び、37 組がすべて満たされたら止めます。各ケースが新しく満たした組の数は、下の表の「新しく満たした組」に書いてあります（合計 37 組）。
7. 保証しないこと: 3 つ以上の入力が特定の値で揃ったときだけ起きる不具合。そうした条件が仕様にあるなら、ディシジョンテーブルに書いてください（ディシジョンテーブルは全組み合わせに展開されます）。

### 実行するケース

| # | member | island | subtotal | payment | 新しく満たした組 | 期待値 |
|---|---|---|---|---|---|---|
| P01 | gold | Y | 有料（2500） | card | 6 | shipping=0, fee=0 |
| P02 | gold | N | 無料（7499） | konbini | 6 | shipping=0, fee=0 |
| P03 | regular | Y | 無料（7499） | cod | 6 | shipping=1000, fee=330 |
| P04 | regular | N | 高額（55000） | card | 6 | shipping=0, fee=0 |
| P05 | gold | Y | 高額（55000） | konbini | 4 | shipping=0, fee=0 |
| P06 | gold | N | 有料（2500） | cod | 4 | shipping=0, fee=330 |
| P07 | regular | Y | 有料（2500） | konbini | 3 | shipping=1500, fee=0 |
| P08 | gold | Y | 無料（7499） | card | 1 | shipping=0, fee=0 |
| P09 | gold | Y | 高額（55000） | cod | 1 | shipping=0, fee=0 |

整数の入力は区間名と、実際に送る代表値（区間の中央）を書いています。期待値はディシジョンテーブルから引いています。

<details>
<summary>全 36 通りの一覧（「実行」が空欄のものは実行しません）</summary>

| # | member | island | subtotal | payment | 実行 |
|---|---|---|---|---|---|
| 1 | gold | Y | 有料 | card | P01 |
| 2 | gold | Y | 有料 | konbini |  |
| 3 | gold | Y | 有料 | cod |  |
| 4 | gold | Y | 無料 | card | P08 |
| 5 | gold | Y | 無料 | konbini |  |
| 6 | gold | Y | 無料 | cod |  |
| 7 | gold | Y | 高額 | card |  |
| 8 | gold | Y | 高額 | konbini | P05 |
| 9 | gold | Y | 高額 | cod | P09 |
| 10 | gold | N | 有料 | card |  |
| 11 | gold | N | 有料 | konbini |  |
| 12 | gold | N | 有料 | cod | P06 |
| 13 | gold | N | 無料 | card |  |
| 14 | gold | N | 無料 | konbini | P02 |
| 15 | gold | N | 無料 | cod |  |
| 16 | gold | N | 高額 | card |  |
| 17 | gold | N | 高額 | konbini |  |
| 18 | gold | N | 高額 | cod |  |
| 19 | regular | Y | 有料 | card |  |
| 20 | regular | Y | 有料 | konbini | P07 |
| 21 | regular | Y | 有料 | cod |  |
| 22 | regular | Y | 無料 | card |  |
| 23 | regular | Y | 無料 | konbini |  |
| 24 | regular | Y | 無料 | cod | P03 |
| 25 | regular | Y | 高額 | card |  |
| 26 | regular | Y | 高額 | konbini |  |
| 27 | regular | Y | 高額 | cod |  |
| 28 | regular | N | 有料 | card |  |
| 29 | regular | N | 有料 | konbini |  |
| 30 | regular | N | 有料 | cod |  |
| 31 | regular | N | 無料 | card |  |
| 32 | regular | N | 無料 | konbini |  |
| 33 | regular | N | 無料 | cod |  |
| 34 | regular | N | 高額 | card | P04 |
| 35 | regular | N | 高額 | konbini |  |
| 36 | regular | N | 高額 | cod |  |

</details>

<details>
<summary>37 組それぞれを満たすケース（すべての行が 1 件以上で埋まっていることの確認）</summary>

| 入力の組 | 値 | 満たすケース |
|---|---|---|
| member × island | gold, Y | P01, P05, P08, P09 |
| member × island | gold, N | P02, P06 |
| member × island | regular, Y | P03, P07 |
| member × island | regular, N | P04 |
| member × subtotal | gold, 有料 | P01, P06 |
| member × subtotal | gold, 無料 | P02, P08 |
| member × subtotal | gold, 高額 | P05, P09 |
| member × subtotal | regular, 有料 | P07 |
| member × subtotal | regular, 無料 | P03 |
| member × subtotal | regular, 高額 | P04 |
| member × payment | gold, card | P01, P08 |
| member × payment | gold, konbini | P02, P05 |
| member × payment | gold, cod | P06, P09 |
| member × payment | regular, card | P04 |
| member × payment | regular, konbini | P07 |
| member × payment | regular, cod | P03 |
| island × subtotal | Y, 有料 | P01, P07 |
| island × subtotal | Y, 無料 | P03, P08 |
| island × subtotal | Y, 高額 | P05, P09 |
| island × subtotal | N, 有料 | P06 |
| island × subtotal | N, 無料 | P02 |
| island × subtotal | N, 高額 | P04 |
| island × payment | Y, card | P01, P08 |
| island × payment | Y, konbini | P05, P07 |
| island × payment | Y, cod | P03, P09 |
| island × payment | N, card | P04 |
| island × payment | N, konbini | P02 |
| island × payment | N, cod | P06 |
| subtotal × payment | 有料, card | P01 |
| subtotal × payment | 有料, konbini | P07 |
| subtotal × payment | 有料, cod | P06 |
| subtotal × payment | 無料, card | P08 |
| subtotal × payment | 無料, konbini | P02 |
| subtotal × payment | 無料, cod | P03 |
| subtotal × payment | 高額, card | P04 |
| subtotal × payment | 高額, konbini | P05 |
| subtotal × payment | 高額, cod | P09 |

</details>

---

全ケースの一覧は shipping.cases.md にあります（差分確認用。通読は不要です）。
