// 送料計算の binding（人が 1 回だけ書く）
import { defineBinding } from '../qa-gen/binding.ts';
import { calcShipping } from '../src/shipping.ts';
import { testServer } from './http-server.ts';

const http = testServer();

export default defineBinding({
  unit: {
    run: async (input) => ({ ...calcShipping(input) }),
  },
  http: {
    setup: http.setup,
    teardown: http.teardown,
    run: async (input) => {
      const { status, body } = await http.post('/shipping-fee', input);
      // HTTP 層の約束: エラーは 400、それ以外は 200
      if ((body.error !== undefined) !== (status === 400)) throw new Error(`status ${status} と本文 ${JSON.stringify(body)} が合いません`);
      return body;
    },
  },
});
