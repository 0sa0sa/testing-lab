<!-- 自動生成ファイルです。手で編集しないでください。元: shipping.qa.md（差分確認用） -->

# 送料計算 — 全ケース一覧

> 仕様を変えたときに、どのケースが増えた・減った・変わったかを PR の差分で確かめるためのファイルです。通読は不要です。要約は summary.md を見てください。

既定値: member=regular, island=N, subtotal=3000, payment=card。各行には既定値から変えた入力だけを書きます。

## ディシジョンテーブル: 送料（20）

| ID | 入力 | 期待値 |
|---|---|---|
| R1[範囲外下,gold,Y] | member=gold, island=Y, subtotal=0 | error=INVALID_SUBTOTAL |
| R1[範囲外下,gold,N] | member=gold, subtotal=0 | error=INVALID_SUBTOTAL |
| R1[範囲外下,regular,Y] | island=Y, subtotal=0 | error=INVALID_SUBTOTAL |
| R1[範囲外下,regular,N] | subtotal=0 | error=INVALID_SUBTOTAL |
| R1[範囲外上,gold,Y] | member=gold, island=Y, subtotal=100001 | error=INVALID_SUBTOTAL |
| R1[範囲外上,gold,N] | member=gold, subtotal=100001 | error=INVALID_SUBTOTAL |
| R1[範囲外上,regular,Y] | island=Y, subtotal=100001 | error=INVALID_SUBTOTAL |
| R1[範囲外上,regular,N] | subtotal=100001 | error=INVALID_SUBTOTAL |
| R2[有料,gold,Y] | member=gold, island=Y, subtotal=2500 | shipping=0, fee=0 |
| R2[有料,gold,N] | member=gold, subtotal=2500 | shipping=0, fee=0 |
| R2[無料,gold,Y] | member=gold, island=Y, subtotal=7499 | shipping=0, fee=0 |
| R2[無料,gold,N] | member=gold, subtotal=7499 | shipping=0, fee=0 |
| R2[高額,gold,Y] | member=gold, island=Y, subtotal=55000 | shipping=0, fee=0 |
| R2[高額,gold,N] | member=gold, subtotal=55000 | shipping=0, fee=0 |
| R3 | subtotal=2500 | shipping=500, fee=0 |
| R4 | island=Y, subtotal=2500 | shipping=1500, fee=0 |
| R5[無料,regular,N] | subtotal=7499 | shipping=0, fee=0 |
| R5[高額,regular,N] | subtotal=55000 | shipping=0, fee=0 |
| R6[無料,regular,Y] | island=Y, subtotal=7499 | shipping=1000, fee=0 |
| R6[高額,regular,Y] | island=Y, subtotal=55000 | shipping=1000, fee=0 |

## ディシジョンテーブル: 手数料（15）

| ID | 入力 | 期待値 |
|---|---|---|
| F1[範囲外下,card] | subtotal=0 | error=INVALID_SUBTOTAL |
| F1[範囲外下,konbini] | subtotal=0, payment=konbini | error=INVALID_SUBTOTAL |
| F1[範囲外下,cod] | subtotal=0, payment=cod | error=INVALID_SUBTOTAL |
| F1[範囲外上,card] | subtotal=100001 | error=INVALID_SUBTOTAL |
| F1[範囲外上,konbini] | subtotal=100001, payment=konbini | error=INVALID_SUBTOTAL |
| F1[範囲外上,cod] | subtotal=100001, payment=cod | error=INVALID_SUBTOTAL |
| F2[有料,card] | subtotal=2500 | shipping=500, fee=0 |
| F2[有料,konbini] | subtotal=2500, payment=konbini | shipping=500, fee=0 |
| F2[無料,card] | subtotal=7499 | shipping=0, fee=0 |
| F2[無料,konbini] | subtotal=7499, payment=konbini | shipping=0, fee=0 |
| F2[高額,card] | subtotal=55000 | shipping=0, fee=0 |
| F2[高額,konbini] | subtotal=55000, payment=konbini | shipping=0, fee=0 |
| F3[有料,cod] | subtotal=2500, payment=cod | shipping=500, fee=330 |
| F3[無料,cod] | subtotal=7499, payment=cod | shipping=0, fee=330 |
| F4 | subtotal=55000, payment=cod | shipping=0, fee=0 |

## 境界値: subtotal（26）

| ID | 入力 | 期待値 |
|---|---|---|
| subtotal=0 | subtotal=0 | error=INVALID_SUBTOTAL |
| subtotal=1 | subtotal=1 | shipping=500, fee=0 |
| subtotal=1/R2 | member=gold, subtotal=1 | shipping=0, fee=0 |
| subtotal=1/R4 | island=Y, subtotal=1 | shipping=1500, fee=0 |
| subtotal=1/F3 | subtotal=1, payment=cod | shipping=500, fee=330 |
| subtotal=4999 | subtotal=4999 | shipping=500, fee=0 |
| subtotal=4999/R2 | member=gold, subtotal=4999 | shipping=0, fee=0 |
| subtotal=4999/R4 | island=Y, subtotal=4999 | shipping=1500, fee=0 |
| subtotal=4999/F3 | subtotal=4999, payment=cod | shipping=500, fee=330 |
| subtotal=5000 | subtotal=5000 | shipping=0, fee=0 |
| subtotal=5000/R2 | member=gold, subtotal=5000 | shipping=0, fee=0 |
| subtotal=5000/R6 | island=Y, subtotal=5000 | shipping=1000, fee=0 |
| subtotal=5000/F3 | subtotal=5000, payment=cod | shipping=0, fee=330 |
| subtotal=9999 | subtotal=9999 | shipping=0, fee=0 |
| subtotal=9999/R2 | member=gold, subtotal=9999 | shipping=0, fee=0 |
| subtotal=9999/R6 | island=Y, subtotal=9999 | shipping=1000, fee=0 |
| subtotal=9999/F3 | subtotal=9999, payment=cod | shipping=0, fee=330 |
| subtotal=10000 | subtotal=10000 | shipping=0, fee=0 |
| subtotal=10000/R2 | member=gold, subtotal=10000 | shipping=0, fee=0 |
| subtotal=10000/R6 | island=Y, subtotal=10000 | shipping=1000, fee=0 |
| subtotal=10000/F4 | subtotal=10000, payment=cod | shipping=0, fee=0 |
| subtotal=100000 | subtotal=100000 | shipping=0, fee=0 |
| subtotal=100000/R2 | member=gold, subtotal=100000 | shipping=0, fee=0 |
| subtotal=100000/R6 | island=Y, subtotal=100000 | shipping=1000, fee=0 |
| subtotal=100000/F4 | subtotal=100000, payment=cod | shipping=0, fee=0 |
| subtotal=100001 | subtotal=100001 | error=INVALID_SUBTOTAL |

## 不正な入力（20）

| ID | 入力 | 期待値 |
|---|---|---|
| member:未知="platinum" | member="platinum" | error=INVALID_MEMBER |
| member:未知="" | member="" | error=INVALID_MEMBER |
| member:未知="GOLD" | member="GOLD" | error=INVALID_MEMBER |
| member:型違い=1 | member=1 | error=INVALID_MEMBER |
| member:型違い=true | member=true | error=INVALID_MEMBER |
| member:型違い=null | member=null | error=INVALID_MEMBER |
| member:型違い=(なし) | member=(なし) | error=INVALID_MEMBER |
| island:型違い="true" | island="true" | error=INVALID_ISLAND |
| island:型違い=1 | island=1 | error=INVALID_ISLAND |
| island:型違い=null | island=null | error=INVALID_ISLAND |
| island:型違い=(なし) | island=(なし) | error=INVALID_ISLAND |
| subtotal:小数=3000.5 | subtotal=3000.5 | error=INVALID_SUBTOTAL |
| subtotal:型違い="3000" | subtotal="3000" | error=INVALID_SUBTOTAL |
| subtotal:型違い=null | subtotal=null | error=INVALID_SUBTOTAL |
| subtotal:型違い=(なし) | subtotal=(なし) | error=INVALID_SUBTOTAL |
| payment:未知="paypay" | payment="paypay" | error=INVALID_PAYMENT |
| payment:未知="" | payment="" | error=INVALID_PAYMENT |
| payment:型違い=0 | payment=0 | error=INVALID_PAYMENT |
| payment:型違い=null | payment=null | error=INVALID_PAYMENT |
| payment:型違い=(なし) | payment=(なし) | error=INVALID_PAYMENT |

## 組み合わせ: 有効な入力（9）

| ID | 入力 | 期待値 |
|---|---|---|
| P01 | member=gold, island=Y, subtotal=2500 | shipping=0, fee=0 |
| P02 | member=gold, subtotal=7499, payment=konbini | shipping=0, fee=0 |
| P03 | island=Y, subtotal=7499, payment=cod | shipping=1000, fee=330 |
| P04 | subtotal=55000 | shipping=0, fee=0 |
| P05 | member=gold, island=Y, subtotal=55000, payment=konbini | shipping=0, fee=0 |
| P06 | member=gold, subtotal=2500, payment=cod | shipping=0, fee=330 |
| P07 | island=Y, subtotal=2500, payment=konbini | shipping=1500, fee=0 |
| P08 | member=gold, island=Y, subtotal=7499 | shipping=0, fee=0 |
| P09 | member=gold, island=Y, subtotal=55000, payment=cod | shipping=0, fee=0 |
