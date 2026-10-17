---
feature: 送料計算
binding: ./shipping.binding.ts
layers: [unit, http]

inputs:
  member:   { type: enum, values: [gold, regular] }
  island:   { type: bool }
  subtotal: { type: int }
  payment:  { type: enum, values: [card, konbini, cod] }

outputs:
  shipping: int
  fee:      int
  error:    string

# 表に出てこない入力はこの値を使う
base:
  member: regular
  island: false
  subtotal: 3000
  payment: card
---

# 送料計算

商品小計・会員種別・離島かどうかで送料を決め、支払い方法で手数料を決める。
表に書いていない出力（空欄や列なし）は、ディシジョンテーブルの答えで埋まる。

## boundary: subtotal

| 区間     | 最小   | 最大   | => error         | 備考                   |
|----------|--------|--------|------------------|------------------------|
| 範囲外下 |        | 0      | INVALID_SUBTOTAL | 1 円未満は受け付けない |
| 有料     | 1      | 4999   | -                |                        |
| 無料     | 5000   | 9999   | -                | 5,000 円以上で送料無料 |
| 高額     | 10000  | 100000 | -                | 代引手数料も無料       |
| 範囲外上 | 100001 |        | INVALID_SUBTOTAL | 上限 10 万円           |

## decision: 送料ルール

| ルール | subtotal          | member  | island | => shipping | => error         | 備考                       |
|--------|-------------------|---------|--------|-------------|------------------|----------------------------|
| R1     | 範囲外下,範囲外上 | -       | -      | -           | INVALID_SUBTOTAL | 金額チェックが最優先       |
| R2     | 有料,無料,高額    | gold    | -      | 0           | -                | ゴールド会員は離島でも無料 |
| R3     | 有料              | regular | N      | 500         | -                |                            |
| R4     | 有料              | regular | Y      | 1500        | -                | 離島は +1,000 円           |
| R5     | 無料,高額         | regular | N      | 0           | -                |                            |
| R6     | 無料,高額         | regular | Y      | 1000        | -                | 無料でも離島料金はかかる   |

## decision: 手数料ルール

| ルール | subtotal          | payment      | => fee | 備考                   |
|--------|-------------------|--------------|--------|------------------------|
| F1     | 範囲外下,範囲外上 | -            | -      | エラー時は手数料なし   |
| F2     | 有料,無料,高額    | card,konbini | 0      |                        |
| F3     | 有料,無料         | cod          | 330    | 代引手数料             |
| F4     | 高額              | cod          | 0      | 1 万円以上は代引も無料 |

## equivalence: member

| クラス   | 種別 | 値                    | => error       | 備考                   |
|----------|------|-----------------------|----------------|------------------------|
| 会員種別 | 有効 | gold, regular         |                |                        |
| 未知     | 無効 | platinum, "", "GOLD"  | INVALID_MEMBER | 大文字小文字は区別する |
| 型違い   | 無効 | 1, true, null, (なし) | INVALID_MEMBER |                        |

## equivalence: island

| クラス | 種別 | 値                      | => error       | 備考                   |
|--------|------|-------------------------|----------------|------------------------|
| 真偽値 | 有効 | true, false             |                |                        |
| 型違い | 無効 | "true", 1, null, (なし) | INVALID_ISLAND | 文字列の "true" は不可 |

## equivalence: subtotal

| クラス | 種別 | 値                   | => error         | 備考               |
|--------|------|----------------------|------------------|--------------------|
| 整数   | 有効 | 3000                 |                  |                    |
| 小数   | 無効 | 3000.5               | INVALID_SUBTOTAL |                    |
| 型違い | 無効 | "3000", null, (なし) | INVALID_SUBTOTAL | 数字の文字列も不可 |

## equivalence: payment

| クラス   | 種別 | 値                 | => error        | 備考 |
|----------|------|--------------------|-----------------|------|
| 支払方法 | 有効 | card, konbini, cod |                 |      |
| 未知     | 無効 | paypay, ""         | INVALID_PAYMENT |      |
| 型違い   | 無効 | 0, null, (なし)    | INVALID_PAYMENT |      |

## pairwise: 有効な入力の組み合わせ

| 因子     | 水準           |
|----------|----------------|
| member   | -              |
| island   | -              |
| subtotal | 有料,無料,高額 |
| payment  | -              |
