<!-- 自動生成ファイルです。手で編集しないでください。元: shipping.qa.md -->

# 送料計算 — 展開済みテストケース

- ケース数: 98（decision: 送料ルール 20、decision: 手数料ルール 15、boundary: subtotal 26、equivalence: member 9、equivalence: island 6、equivalence: subtotal 5、equivalence: payment 8、pairwise: 有効な入力の組み合わせ 9）
- 層: unit, http（各層で同じケースを実行します）
- 表に出てこない入力の既定値: member=regular, island=N, subtotal=3000, payment=card

## decision: 送料ルール

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| R1[範囲外下,gold,Y] | R1 | **gold** | **Y** | **0** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外下,gold,N] | R1 | **gold** | N | **0** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外下,regular,Y] | R1 | regular | **Y** | **0** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外下,regular,N] | R1 | regular | N | **0** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,gold,Y] | R1 | **gold** | **Y** | **100001** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,gold,N] | R1 | **gold** | N | **100001** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,regular,Y] | R1 | regular | **Y** | **100001** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,regular,N] | R1 | regular | N | **100001** | card | - | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R2[有料,gold,Y] | R2 | **gold** | **Y** | **2500** | card | 0 | 0 | - | ゴールド会員は離島でも無料 |
| R2[有料,gold,N] | R2 | **gold** | N | **2500** | card | 0 | 0 | - | ゴールド会員は離島でも無料 |
| R2[無料,gold,Y] | R2 | **gold** | **Y** | **7499** | card | 0 | 0 | - | ゴールド会員は離島でも無料 |
| R2[無料,gold,N] | R2 | **gold** | N | **7499** | card | 0 | 0 | - | ゴールド会員は離島でも無料 |
| R2[高額,gold,Y] | R2 | **gold** | **Y** | **55000** | card | 0 | 0 | - | ゴールド会員は離島でも無料 |
| R2[高額,gold,N] | R2 | **gold** | N | **55000** | card | 0 | 0 | - | ゴールド会員は離島でも無料 |
| R3 | R3 | regular | N | **2500** | card | 500 | 0 | - |  |
| R4 | R4 | regular | **Y** | **2500** | card | 1500 | 0 | - | 離島は +1,000 円 |
| R5[無料,regular,N] | R5 | regular | N | **7499** | card | 0 | 0 | - |  |
| R5[高額,regular,N] | R5 | regular | N | **55000** | card | 0 | 0 | - |  |
| R6[無料,regular,Y] | R6 | regular | **Y** | **7499** | card | 1000 | 0 | - | 無料でも離島料金はかかる |
| R6[高額,regular,Y] | R6 | regular | **Y** | **55000** | card | 1000 | 0 | - | 無料でも離島料金はかかる |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない

## decision: 手数料ルール

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| F1[範囲外下,card] | F1 | regular | N | **0** | card | - | - | INVALID_SUBTOTAL | エラー時は手数料なし |
| F1[範囲外下,konbini] | F1 | regular | N | **0** | **konbini** | - | - | INVALID_SUBTOTAL | エラー時は手数料なし |
| F1[範囲外下,cod] | F1 | regular | N | **0** | **cod** | - | - | INVALID_SUBTOTAL | エラー時は手数料なし |
| F1[範囲外上,card] | F1 | regular | N | **100001** | card | - | - | INVALID_SUBTOTAL | エラー時は手数料なし |
| F1[範囲外上,konbini] | F1 | regular | N | **100001** | **konbini** | - | - | INVALID_SUBTOTAL | エラー時は手数料なし |
| F1[範囲外上,cod] | F1 | regular | N | **100001** | **cod** | - | - | INVALID_SUBTOTAL | エラー時は手数料なし |
| F2[有料,card] | F2 | regular | N | **2500** | card | 500 | 0 | - |  |
| F2[有料,konbini] | F2 | regular | N | **2500** | **konbini** | 500 | 0 | - |  |
| F2[無料,card] | F2 | regular | N | **7499** | card | 0 | 0 | - |  |
| F2[無料,konbini] | F2 | regular | N | **7499** | **konbini** | 0 | 0 | - |  |
| F2[高額,card] | F2 | regular | N | **55000** | card | 0 | 0 | - |  |
| F2[高額,konbini] | F2 | regular | N | **55000** | **konbini** | 0 | 0 | - |  |
| F3[有料,cod] | F3 | regular | N | **2500** | **cod** | 500 | 330 | - | 代引手数料 |
| F3[無料,cod] | F3 | regular | N | **7499** | **cod** | 0 | 330 | - | 代引手数料 |
| F4 | F4 | regular | N | **55000** | **cod** | 0 | 0 | - | 1 万円以上は代引も無料 |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない

## boundary: subtotal

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| subtotal=0 | 範囲外下 | regular | N | **0** | card | - | - | INVALID_SUBTOTAL | 1 円未満は受け付けない |
| subtotal=1 | 有料 | regular | N | **1** | card | 500 | 0 | - |  |
| subtotal=1/R2 | 有料 | **gold** | N | **1** | card | 0 | 0 | - | 送料ルール R2 の条件で |
| subtotal=1/R4 | 有料 | regular | **Y** | **1** | card | 1500 | 0 | - | 送料ルール R4 の条件で |
| subtotal=1/F3 | 有料 | regular | N | **1** | **cod** | 500 | 330 | - | 手数料ルール F3 の条件で |
| subtotal=4999 | 有料 | regular | N | **4999** | card | 500 | 0 | - |  |
| subtotal=4999/R2 | 有料 | **gold** | N | **4999** | card | 0 | 0 | - | 送料ルール R2 の条件で |
| subtotal=4999/R4 | 有料 | regular | **Y** | **4999** | card | 1500 | 0 | - | 送料ルール R4 の条件で |
| subtotal=4999/F3 | 有料 | regular | N | **4999** | **cod** | 500 | 330 | - | 手数料ルール F3 の条件で |
| subtotal=5000 | 無料 | regular | N | **5000** | card | 0 | 0 | - | 5,000 円以上で送料無料 |
| subtotal=5000/R2 | 無料 | **gold** | N | **5000** | card | 0 | 0 | - | 5,000 円以上で送料無料、送料ルール R2 の条件で |
| subtotal=5000/R6 | 無料 | regular | **Y** | **5000** | card | 1000 | 0 | - | 5,000 円以上で送料無料、送料ルール R6 の条件で |
| subtotal=5000/F3 | 無料 | regular | N | **5000** | **cod** | 0 | 330 | - | 5,000 円以上で送料無料、手数料ルール F3 の条件で |
| subtotal=9999 | 無料 | regular | N | **9999** | card | 0 | 0 | - | 5,000 円以上で送料無料 |
| subtotal=9999/R2 | 無料 | **gold** | N | **9999** | card | 0 | 0 | - | 5,000 円以上で送料無料、送料ルール R2 の条件で |
| subtotal=9999/R6 | 無料 | regular | **Y** | **9999** | card | 1000 | 0 | - | 5,000 円以上で送料無料、送料ルール R6 の条件で |
| subtotal=9999/F3 | 無料 | regular | N | **9999** | **cod** | 0 | 330 | - | 5,000 円以上で送料無料、手数料ルール F3 の条件で |
| subtotal=10000 | 高額 | regular | N | **10000** | card | 0 | 0 | - | 代引手数料も無料 |
| subtotal=10000/R2 | 高額 | **gold** | N | **10000** | card | 0 | 0 | - | 代引手数料も無料、送料ルール R2 の条件で |
| subtotal=10000/R6 | 高額 | regular | **Y** | **10000** | card | 1000 | 0 | - | 代引手数料も無料、送料ルール R6 の条件で |
| subtotal=10000/F4 | 高額 | regular | N | **10000** | **cod** | 0 | 0 | - | 代引手数料も無料、手数料ルール F4 の条件で |
| subtotal=100000 | 高額 | regular | N | **100000** | card | 0 | 0 | - | 代引手数料も無料 |
| subtotal=100000/R2 | 高額 | **gold** | N | **100000** | card | 0 | 0 | - | 代引手数料も無料、送料ルール R2 の条件で |
| subtotal=100000/R6 | 高額 | regular | **Y** | **100000** | card | 1000 | 0 | - | 代引手数料も無料、送料ルール R6 の条件で |
| subtotal=100000/F4 | 高額 | regular | N | **100000** | **cod** | 0 | 0 | - | 代引手数料も無料、手数料ルール F4 の条件で |
| subtotal=100001 | 範囲外上 | regular | N | **100001** | card | - | - | INVALID_SUBTOTAL | 上限 10 万円 |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない

## equivalence: member

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| member:会員種別="gold" | 会員種別 | **gold** | N | 3000 | card | 0 | 0 | - |  |
| member:会員種別="regular" | 会員種別 | regular | N | 3000 | card | 500 | 0 | - |  |
| member:未知="platinum" | 未知 | **"platinum"** | N | 3000 | card | - | - | INVALID_MEMBER | 大文字小文字は区別する |
| member:未知="" | 未知 | **""** | N | 3000 | card | - | - | INVALID_MEMBER | 大文字小文字は区別する |
| member:未知="GOLD" | 未知 | **"GOLD"** | N | 3000 | card | - | - | INVALID_MEMBER | 大文字小文字は区別する |
| member:型違い=1 | 型違い | **1** | N | 3000 | card | - | - | INVALID_MEMBER |  |
| member:型違い=true | 型違い | **true** | N | 3000 | card | - | - | INVALID_MEMBER |  |
| member:型違い=null | 型違い | **null** | N | 3000 | card | - | - | INVALID_MEMBER |  |
| member:型違い=(なし) | 型違い | **(なし)** | N | 3000 | card | - | - | INVALID_MEMBER |  |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない

## equivalence: island

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| island:真偽値=true | 真偽値 | regular | **Y** | 3000 | card | 1500 | 0 | - |  |
| island:真偽値=false | 真偽値 | regular | N | 3000 | card | 500 | 0 | - |  |
| island:型違い="true" | 型違い | regular | **"true"** | 3000 | card | - | - | INVALID_ISLAND | 文字列の "true" は不可 |
| island:型違い=1 | 型違い | regular | **1** | 3000 | card | - | - | INVALID_ISLAND | 文字列の "true" は不可 |
| island:型違い=null | 型違い | regular | **null** | 3000 | card | - | - | INVALID_ISLAND | 文字列の "true" は不可 |
| island:型違い=(なし) | 型違い | regular | **(なし)** | 3000 | card | - | - | INVALID_ISLAND | 文字列の "true" は不可 |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない

## equivalence: subtotal

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| subtotal:整数=3000 | 整数 | regular | N | 3000 | card | 500 | 0 | - |  |
| subtotal:小数=3000.5 | 小数 | regular | N | **3000.5** | card | - | - | INVALID_SUBTOTAL |  |
| subtotal:型違い="3000" | 型違い | regular | N | **"3000"** | card | - | - | INVALID_SUBTOTAL | 数字の文字列も不可 |
| subtotal:型違い=null | 型違い | regular | N | **null** | card | - | - | INVALID_SUBTOTAL | 数字の文字列も不可 |
| subtotal:型違い=(なし) | 型違い | regular | N | **(なし)** | card | - | - | INVALID_SUBTOTAL | 数字の文字列も不可 |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない

## equivalence: payment

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| payment:支払方法="card" | 支払方法 | regular | N | 3000 | card | 500 | 0 | - |  |
| payment:支払方法="konbini" | 支払方法 | regular | N | 3000 | **konbini** | 500 | 0 | - |  |
| payment:支払方法="cod" | 支払方法 | regular | N | 3000 | **cod** | 500 | 330 | - |  |
| payment:未知="paypay" | 未知 | regular | N | 3000 | **"paypay"** | - | - | INVALID_PAYMENT |  |
| payment:未知="" | 未知 | regular | N | 3000 | **""** | - | - | INVALID_PAYMENT |  |
| payment:型違い=0 | 型違い | regular | N | 3000 | **0** | - | - | INVALID_PAYMENT |  |
| payment:型違い=null | 型違い | regular | N | 3000 | **null** | - | - | INVALID_PAYMENT |  |
| payment:型違い=(なし) | 型違い | regular | N | 3000 | **(なし)** | - | - | INVALID_PAYMENT |  |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない

## pairwise: 有効な入力の組み合わせ

因子 4 個（member: gold/regular、island: Y/N、subtotal: 有料/無料/高額、payment: card/konbini/cod）
全組み合わせ 36 件 → 9 件。2 因子間の組 37 組をすべて含みます。期待値はディシジョンテーブルから引いています。

| ID | 行 | member | island | subtotal | payment | => shipping | => fee | => error | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| P01 |  | **gold** | **Y** | **2500** | card | 0 | 0 | - | member=gold, island=Y, subtotal=有料, payment=card |
| P02 |  | **gold** | N | **7499** | **konbini** | 0 | 0 | - | member=gold, island=N, subtotal=無料, payment=konbini |
| P03 |  | regular | **Y** | **7499** | **cod** | 1000 | 330 | - | member=regular, island=Y, subtotal=無料, payment=cod |
| P04 |  | regular | N | **55000** | card | 0 | 0 | - | member=regular, island=N, subtotal=高額, payment=card |
| P05 |  | **gold** | **Y** | **55000** | **konbini** | 0 | 0 | - | member=gold, island=Y, subtotal=高額, payment=konbini |
| P06 |  | **gold** | N | **2500** | **cod** | 0 | 330 | - | member=gold, island=N, subtotal=有料, payment=cod |
| P07 |  | regular | **Y** | **2500** | **konbini** | 1500 | 0 | - | member=regular, island=Y, subtotal=有料, payment=konbini |
| P08 |  | **gold** | **Y** | **7499** | card | 0 | 0 | - | member=gold, island=Y, subtotal=無料, payment=card |
| P09 |  | **gold** | **Y** | **55000** | **cod** | 0 | 0 | - | member=gold, island=Y, subtotal=高額, payment=cod |

太字 = 既定値から変えた入力。(なし) = そのキーを送らない
