// デモアプリ: 送料計算
export type Member = 'gold' | 'regular';
export type Payment = 'card' | 'konbini' | 'cod';

export interface ShippingInput {
  member: Member;
  island: boolean; // 離島配送か
  subtotal: number; // 商品小計（円）
  payment: Payment;
}

export type ShippingError = 'INVALID_SUBTOTAL' | 'INVALID_MEMBER' | 'INVALID_ISLAND' | 'INVALID_PAYMENT';
export type ShippingResult = { shipping: number; fee: number } | { error: ShippingError };

export const MIN_SUBTOTAL = 1;
export const MAX_SUBTOTAL = 100_000;
export const FREE_THRESHOLD = 5_000;
export const COD_FEE = 330;
export const COD_FREE_THRESHOLD = 10_000;

const MEMBERS: readonly unknown[] = ['gold', 'regular'];
const PAYMENTS: readonly unknown[] = ['card', 'konbini', 'cod'];

/** 外部からの値（JSON 由来）をそのまま受ける */
export function calcShipping(input: Record<string, unknown>): ShippingResult {
  const { member, island, subtotal, payment } = input;
  if (typeof subtotal !== 'number' || !Number.isInteger(subtotal) || subtotal < MIN_SUBTOTAL || subtotal > MAX_SUBTOTAL) {
    return { error: 'INVALID_SUBTOTAL' };
  }
  if (!MEMBERS.includes(member)) return { error: 'INVALID_MEMBER' };
  if (typeof island !== 'boolean') return { error: 'INVALID_ISLAND' };
  if (!PAYMENTS.includes(payment)) return { error: 'INVALID_PAYMENT' };

  // 代引手数料: 1 万円以上なら無料
  const fee = payment === 'cod' && subtotal < COD_FREE_THRESHOLD ? COD_FEE : 0;
  if (member === 'gold') return { shipping: 0, fee };
  const base = subtotal >= FREE_THRESHOLD ? 0 : 500;
  return { shipping: base + (island ? 1000 : 0), fee };
}
