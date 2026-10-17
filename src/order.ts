// デモアプリ: 注文の状態遷移
export type OrderState = 'cart' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type OrderEvent = 'checkout' | 'pay' | 'ship' | 'deliver' | 'cancel';

const TRANSITIONS: Record<OrderState, Partial<Record<OrderEvent, OrderState>>> = {
  cart: { checkout: 'pending' },
  pending: { pay: 'paid', cancel: 'cancelled' },
  paid: { ship: 'shipped', cancel: 'refunded' },
  shipped: { deliver: 'delivered' },
  delivered: {},
  cancelled: {},
  refunded: {},
};

export class InvalidTransition extends Error {
  readonly state: OrderState;
  readonly event: string;
  constructor(state: OrderState, event: string) {
    super(`${state} では ${event} できません`);
    this.state = state;
    this.event = event;
  }
}

export class Order {
  state: OrderState = 'cart';

  /** 遷移できなければ InvalidTransition を投げ、状態は変えない */
  dispatch(event: string): OrderState {
    const next = TRANSITIONS[this.state][event as OrderEvent];
    if (!next) throw new InvalidTransition(this.state, event);
    this.state = next;
    return next;
  }
}
