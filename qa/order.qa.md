---
feature: 注文の状態
binding: ./order.binding.ts
layers: [unit, http]

# できない操作をしたときの期待値（state は自動で「元のまま」）
invalid_event:
  error: INVALID_TRANSITION
---

# 注文の状態

カート → 注文確定 → 支払い → 発送 → 配達。支払い前の取り消しはキャンセル、支払い後は返金。

## 出力

| 出力  | 型     | 意味                                   |
|-------|--------|----------------------------------------|
| state | 文字列 | 操作の後の状態                         |
| error | 文字列 | できない操作のとき INVALID_TRANSITION |

## 状態遷移: 注文ライフサイクル (1-switch)

```mermaid
stateDiagram-v2
  cart: カート
  pending: 支払い待ち
  paid: 支払い済み
  shipped: 発送済み
  delivered: 配達済み
  cancelled: キャンセル
  refunded: 返金済み

  [*] --> cart
  cart --> pending: checkout
  pending --> paid: pay
  pending --> cancelled: cancel
  paid --> shipped: ship
  paid --> refunded: cancel
  shipped --> delivered: deliver
  delivered --> [*]
  cancelled --> [*]
  refunded --> [*]
```

図に矢印がない操作（例: カートで pay）は、すべて「できない操作」として検査する。
