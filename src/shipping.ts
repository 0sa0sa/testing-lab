// デモアプリ: 送料計算
export type Member = 'gold' | 'regular';

export interface ShippingInput {
  member: Member;
  island: boolean; // 離島配送か
  subtotal: number; // 商品小計（円）
}

export type ShippingResult = { shipping: number } | { error: 'INVALID_SUBTOTAL' };

export const MIN_SUBTOTAL = 1;
export const MAX_SUBTOTAL = 100_000;
export const FREE_THRESHOLD = 5_000;

export function calcShipping(input: ShippingInput): ShippingResult {
  const { member, island, subtotal } = input;
  if (!Number.isInteger(subtotal) || subtotal < MIN_SUBTOTAL || subtotal > MAX_SUBTOTAL) {
    return { error: 'INVALID_SUBTOTAL' };
  }
  if (member === 'gold') return { shipping: 0 };
  const base = subtotal >= FREE_THRESHOLD ? 0 : 500;
  return { shipping: base + (island ? 1000 : 0) };
}
