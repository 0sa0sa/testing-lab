<!-- 自動生成ファイルです。手で編集しないでください。元: order.qa.md（差分確認用） -->

# 注文の状態 — 全ケース一覧

> 仕様を変えたときに、どのケースが増えた・減った・変わったかを PR の差分で確かめるためのファイルです。通読は不要です。要約は summary.md を見てください。

## 状態遷移: 注文ライフサイクル（34）

| ID | 操作 | 期待値 |
|---|---|---|
| cart -checkout-> pending -pay-> paid | **checkout** → **pay** | state=paid |
| cart -checkout-> pending -cancel-> cancelled | **checkout** → **cancel** | state=cancelled |
| pending -pay-> paid -ship-> shipped | checkout → **pay** → **ship** | state=shipped |
| pending -pay-> paid -cancel-> refunded | checkout → **pay** → **cancel** | state=refunded |
| paid -ship-> shipped -deliver-> delivered | checkout → pay → **ship** → **deliver** | state=delivered |
| cart ×pay | **pay** | state=cart, error=INVALID_TRANSITION |
| cart ×cancel | **cancel** | state=cart, error=INVALID_TRANSITION |
| cart ×ship | **ship** | state=cart, error=INVALID_TRANSITION |
| cart ×deliver | **deliver** | state=cart, error=INVALID_TRANSITION |
| pending ×checkout | checkout → **checkout** | state=pending, error=INVALID_TRANSITION |
| pending ×ship | checkout → **ship** | state=pending, error=INVALID_TRANSITION |
| pending ×deliver | checkout → **deliver** | state=pending, error=INVALID_TRANSITION |
| paid ×checkout | checkout → pay → **checkout** | state=paid, error=INVALID_TRANSITION |
| paid ×pay | checkout → pay → **pay** | state=paid, error=INVALID_TRANSITION |
| paid ×deliver | checkout → pay → **deliver** | state=paid, error=INVALID_TRANSITION |
| shipped ×checkout | checkout → pay → ship → **checkout** | state=shipped, error=INVALID_TRANSITION |
| shipped ×pay | checkout → pay → ship → **pay** | state=shipped, error=INVALID_TRANSITION |
| shipped ×cancel | checkout → pay → ship → **cancel** | state=shipped, error=INVALID_TRANSITION |
| shipped ×ship | checkout → pay → ship → **ship** | state=shipped, error=INVALID_TRANSITION |
| delivered ×checkout | checkout → pay → ship → deliver → **checkout** | state=delivered, error=INVALID_TRANSITION |
| delivered ×pay | checkout → pay → ship → deliver → **pay** | state=delivered, error=INVALID_TRANSITION |
| delivered ×cancel | checkout → pay → ship → deliver → **cancel** | state=delivered, error=INVALID_TRANSITION |
| delivered ×ship | checkout → pay → ship → deliver → **ship** | state=delivered, error=INVALID_TRANSITION |
| delivered ×deliver | checkout → pay → ship → deliver → **deliver** | state=delivered, error=INVALID_TRANSITION |
| cancelled ×checkout | checkout → cancel → **checkout** | state=cancelled, error=INVALID_TRANSITION |
| cancelled ×pay | checkout → cancel → **pay** | state=cancelled, error=INVALID_TRANSITION |
| cancelled ×cancel | checkout → cancel → **cancel** | state=cancelled, error=INVALID_TRANSITION |
| cancelled ×ship | checkout → cancel → **ship** | state=cancelled, error=INVALID_TRANSITION |
| cancelled ×deliver | checkout → cancel → **deliver** | state=cancelled, error=INVALID_TRANSITION |
| refunded ×checkout | checkout → pay → cancel → **checkout** | state=refunded, error=INVALID_TRANSITION |
| refunded ×pay | checkout → pay → cancel → **pay** | state=refunded, error=INVALID_TRANSITION |
| refunded ×cancel | checkout → pay → cancel → **cancel** | state=refunded, error=INVALID_TRANSITION |
| refunded ×ship | checkout → pay → cancel → **ship** | state=refunded, error=INVALID_TRANSITION |
| refunded ×deliver | checkout → pay → cancel → **deliver** | state=refunded, error=INVALID_TRANSITION |

太字 = 検査するイベント。その前はそこへ行くための操作で、途中の状態も検査します
