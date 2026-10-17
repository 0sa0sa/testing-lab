---
feature: 送料計算
binding: ./shipping.binding.ts
layers: [unit, http]

inputs:
  member:   { type: enum, values: [gold, regular] }
  island:   { type: bool }
  subtotal: { type: int }

outputs:
  shipping: int
  error:    string

# 表に出てこない入力はこの値を使う
base:
  member: regular
  island: false
  subtotal: 3000
---

# 送料計算

商品小計・会員種別・離島かどうかで送料を決める。

## boundary: subtotal

| 区間     | 最小   | 最大    | => shipping | => error         | 備考               |
|----------|--------|---------|-------------|------------------|--------------------|
| 範囲外下 |        | 0       | -           | INVALID_SUBTOTAL | 1 円未満は受け付けない |
| 有料     | 1      | 4999    | 500         | -                |                    |
| 無料     | 5000   | 100000  | 0           | -                | 5,000 円以上で無料 |
| 範囲外上 | 100001 |         | -           | INVALID_SUBTOTAL | 上限 10 万円       |

## decision: 送料ルール

| ルール | subtotal       | member  | island | => shipping | => error         | 備考                       |
|--------|----------------|---------|--------|-------------|------------------|----------------------------|
| R1     | 範囲外下,範囲外上 | -       | -      | -           | INVALID_SUBTOTAL | 金額チェックが最優先       |
| R2     | 有料,無料      | gold    | -      | 0           | -                | ゴールド会員は離島でも無料 |
| R3     | 有料           | regular | N      | 500         | -                |                            |
| R4     | 有料           | regular | Y      | 1500        | -                | 離島は +1,000 円           |
| R5     | 無料           | regular | N      | 0           | -                |                            |
| R6     | 無料           | regular | Y      | 1000        | -                | 無料でも離島料金はかかる   |
