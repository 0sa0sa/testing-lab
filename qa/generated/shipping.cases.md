<!-- 自動生成ファイルです。手で編集しないでください。元: shipping.qa.md -->

# 送料計算 — 展開済みテストケース

- ケース数: 22（decision 16, boundary 6）
- 層: unit, http（各層で同じケースを実行します）
- 表に出てこない入力の既定値: member=regular, island=N, subtotal=3000

## ケース一覧

| ID | 由来 | member | island | subtotal | => shipping | => error | 備考 |
|---|---|---|---|---|---|---|---|
| R1[範囲外下,gold,Y] | decision: 送料ルール / R1 | **gold** | **Y** | **0** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外下,gold,N] | decision: 送料ルール / R1 | **gold** | N | **0** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外下,regular,Y] | decision: 送料ルール / R1 | regular | **Y** | **0** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外下,regular,N] | decision: 送料ルール / R1 | regular | N | **0** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,gold,Y] | decision: 送料ルール / R1 | **gold** | **Y** | **100001** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,gold,N] | decision: 送料ルール / R1 | **gold** | N | **100001** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,regular,Y] | decision: 送料ルール / R1 | regular | **Y** | **100001** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R1[範囲外上,regular,N] | decision: 送料ルール / R1 | regular | N | **100001** | - | INVALID_SUBTOTAL | 金額チェックが最優先 |
| R2[有料,gold,Y] | decision: 送料ルール / R2 | **gold** | **Y** | **2500** | 0 | - | ゴールド会員は離島でも無料 |
| R2[有料,gold,N] | decision: 送料ルール / R2 | **gold** | N | **2500** | 0 | - | ゴールド会員は離島でも無料 |
| R2[無料,gold,Y] | decision: 送料ルール / R2 | **gold** | **Y** | **52500** | 0 | - | ゴールド会員は離島でも無料 |
| R2[無料,gold,N] | decision: 送料ルール / R2 | **gold** | N | **52500** | 0 | - | ゴールド会員は離島でも無料 |
| R3 | decision: 送料ルール / R3 | regular | N | **2500** | 500 | - |  |
| R4 | decision: 送料ルール / R4 | regular | **Y** | **2500** | 1500 | - | 離島は +1,000 円 |
| R5 | decision: 送料ルール / R5 | regular | N | **52500** | 0 | - |  |
| R6 | decision: 送料ルール / R6 | regular | **Y** | **52500** | 1000 | - | 無料でも離島料金はかかる |
| subtotal=0 | boundary: subtotal / 範囲外下 | regular | N | **0** | - | INVALID_SUBTOTAL | 1 円未満は受け付けない |
| subtotal=1 | boundary: subtotal / 有料 | regular | N | **1** | 500 | - |  |
| subtotal=4999 | boundary: subtotal / 有料 | regular | N | **4999** | 500 | - |  |
| subtotal=5000 | boundary: subtotal / 無料 | regular | N | **5000** | 0 | - | 5,000 円以上で無料 |
| subtotal=100000 | boundary: subtotal / 無料 | regular | N | **100000** | 0 | - | 5,000 円以上で無料 |
| subtotal=100001 | boundary: subtotal / 範囲外上 | regular | N | **100001** | - | INVALID_SUBTOTAL | 上限 10 万円 |

太字 = そのケースで既定値から変えた入力
