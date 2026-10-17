// 注文状態の binding（人が 1 回だけ書く）
import { defineBinding } from '../qa-gen/binding.ts';
import { InvalidTransition, Order } from '../src/order.ts';
import { testServer } from './http-server.ts';

const http = testServer();

export default defineBinding({
  unit: {
    start: async () => {
      const order = new Order();
      return async (event) => {
        try {
          return { state: order.dispatch(event) };
        } catch (e) {
          if (e instanceof InvalidTransition) return { state: order.state, error: 'INVALID_TRANSITION' };
          throw e;
        }
      };
    },
  },
  http: {
    setup: http.setup,
    teardown: http.teardown,
    start: async () => {
      const created = await http.post('/orders');
      if (created.status !== 201) throw new Error(`注文を作れません: ${created.status}`);
      return async (event) => {
        const { status, body } = await http.post(`/orders/${created.body.id}/events`, { event });
        // HTTP 層の約束: 無効な遷移は 409、それ以外は 200
        if ((body.error !== undefined) !== (status === 409)) throw new Error(`status ${status} と本文 ${JSON.stringify(body)} が合いません`);
        return body;
      };
    },
  },
});
