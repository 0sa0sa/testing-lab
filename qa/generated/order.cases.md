<!-- 自動生成ファイルです。手で編集しないでください。元: order.qa.md -->

# 注文の状態 — 展開済みテストケース

- ケース数: 34（state: 注文ライフサイクル 34）
- 層: unit, http（各層で同じケースを実行します）

## state: 注文ライフサイクル

| 状態 \ イベント | checkout | pay | cancel | ship | deliver |
|---|---|---|---|---|---|
| ▶ cart（カート） | pending | × | × | × | × |
| pending（支払い待ち） | × | paid | cancelled | × | × |
| paid（支払い済み） | × | × | refunded | shipped | × |
| shipped（発送済み） | × | × | × | × | delivered |
| delivered（配達済み） | × | × | × | × | × |
| cancelled（キャンセル） | × | × | × | × | × |
| refunded（返金済み） | × | × | × | × | × |

▶ = 初期状態、× = 無効（invalid_event の期待値で、状態は変わらない）

1-switch 網羅: 有効遷移の列 5 件、無効遷移 29 件。各ケースは初期状態から最短経路でたどり、途中の状態もすべて検査します。

| ID | 種類 | 経路 | => state | => error | 備考 |
|---|---|---|---|---|---|
| cart -checkout-> pending -pay-> paid | 有効遷移 | **checkout** → **pay** | paid | - | 支払い待ち → 支払い済み |
| cart -checkout-> pending -cancel-> cancelled | 有効遷移 | **checkout** → **cancel** | cancelled | - | 支払い待ち → キャンセル |
| pending -pay-> paid -ship-> shipped | 有効遷移 | checkout → **pay** → **ship** | shipped | - | 支払い済み → 発送済み |
| pending -pay-> paid -cancel-> refunded | 有効遷移 | checkout → **pay** → **cancel** | refunded | - | 支払い済み → 返金済み |
| paid -ship-> shipped -deliver-> delivered | 有効遷移 | checkout → pay → **ship** → **deliver** | delivered | - | 発送済み → 配達済み |
| cart ×pay | 無効遷移 | **pay** | cart | INVALID_TRANSITION | カートでは pay できない |
| cart ×cancel | 無効遷移 | **cancel** | cart | INVALID_TRANSITION | カートでは cancel できない |
| cart ×ship | 無効遷移 | **ship** | cart | INVALID_TRANSITION | カートでは ship できない |
| cart ×deliver | 無効遷移 | **deliver** | cart | INVALID_TRANSITION | カートでは deliver できない |
| pending ×checkout | 無効遷移 | checkout → **checkout** | pending | INVALID_TRANSITION | 支払い待ちでは checkout できない |
| pending ×ship | 無効遷移 | checkout → **ship** | pending | INVALID_TRANSITION | 支払い待ちでは ship できない |
| pending ×deliver | 無効遷移 | checkout → **deliver** | pending | INVALID_TRANSITION | 支払い待ちでは deliver できない |
| paid ×checkout | 無効遷移 | checkout → pay → **checkout** | paid | INVALID_TRANSITION | 支払い済みでは checkout できない |
| paid ×pay | 無効遷移 | checkout → pay → **pay** | paid | INVALID_TRANSITION | 支払い済みでは pay できない |
| paid ×deliver | 無効遷移 | checkout → pay → **deliver** | paid | INVALID_TRANSITION | 支払い済みでは deliver できない |
| shipped ×checkout | 無効遷移 | checkout → pay → ship → **checkout** | shipped | INVALID_TRANSITION | 発送済みでは checkout できない |
| shipped ×pay | 無効遷移 | checkout → pay → ship → **pay** | shipped | INVALID_TRANSITION | 発送済みでは pay できない |
| shipped ×cancel | 無効遷移 | checkout → pay → ship → **cancel** | shipped | INVALID_TRANSITION | 発送済みでは cancel できない |
| shipped ×ship | 無効遷移 | checkout → pay → ship → **ship** | shipped | INVALID_TRANSITION | 発送済みでは ship できない |
| delivered ×checkout | 無効遷移 | checkout → pay → ship → deliver → **checkout** | delivered | INVALID_TRANSITION | 配達済みでは checkout できない |
| delivered ×pay | 無効遷移 | checkout → pay → ship → deliver → **pay** | delivered | INVALID_TRANSITION | 配達済みでは pay できない |
| delivered ×cancel | 無効遷移 | checkout → pay → ship → deliver → **cancel** | delivered | INVALID_TRANSITION | 配達済みでは cancel できない |
| delivered ×ship | 無効遷移 | checkout → pay → ship → deliver → **ship** | delivered | INVALID_TRANSITION | 配達済みでは ship できない |
| delivered ×deliver | 無効遷移 | checkout → pay → ship → deliver → **deliver** | delivered | INVALID_TRANSITION | 配達済みでは deliver できない |
| cancelled ×checkout | 無効遷移 | checkout → cancel → **checkout** | cancelled | INVALID_TRANSITION | キャンセルでは checkout できない |
| cancelled ×pay | 無効遷移 | checkout → cancel → **pay** | cancelled | INVALID_TRANSITION | キャンセルでは pay できない |
| cancelled ×cancel | 無効遷移 | checkout → cancel → **cancel** | cancelled | INVALID_TRANSITION | キャンセルでは cancel できない |
| cancelled ×ship | 無効遷移 | checkout → cancel → **ship** | cancelled | INVALID_TRANSITION | キャンセルでは ship できない |
| cancelled ×deliver | 無効遷移 | checkout → cancel → **deliver** | cancelled | INVALID_TRANSITION | キャンセルでは deliver できない |
| refunded ×checkout | 無効遷移 | checkout → pay → cancel → **checkout** | refunded | INVALID_TRANSITION | 返金済みでは checkout できない |
| refunded ×pay | 無効遷移 | checkout → pay → cancel → **pay** | refunded | INVALID_TRANSITION | 返金済みでは pay できない |
| refunded ×cancel | 無効遷移 | checkout → pay → cancel → **cancel** | refunded | INVALID_TRANSITION | 返金済みでは cancel できない |
| refunded ×ship | 無効遷移 | checkout → pay → cancel → **ship** | refunded | INVALID_TRANSITION | 返金済みでは ship できない |
| refunded ×deliver | 無効遷移 | checkout → pay → cancel → **deliver** | refunded | INVALID_TRANSITION | 返金済みでは deliver できない |

太字 = 検査対象のイベント。それより前は初期状態からその状態へ行くための経路で、途中の状態も検査します
