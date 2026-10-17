// 送料計算の binding（人が 1 回だけ書く）
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { defineBinding } from '../qa-gen/binding.ts';
import { calcShipping, type ShippingInput } from '../src/shipping.ts';
import { createApp } from '../src/server.ts';

let server: Server;
let baseUrl = '';

export default defineBinding({
  unit: {
    run: async (input) => ({ ...calcShipping(input as unknown as ShippingInput) }),
  },
  http: {
    setup: () =>
      new Promise<void>((ok) => {
        server = createApp().listen(0, () => {
          baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
          ok();
        });
      }),
    teardown: () => new Promise<void>((ok) => server.close(() => ok())),
    run: async (input) => {
      const res = await fetch(`${baseUrl}/shipping-fee`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      // HTTP 層の約束: エラーは 400、それ以外は 200
      if ((body.error !== undefined) !== (res.status === 400)) throw new Error(`status ${res.status} と本文 ${JSON.stringify(body)} が合いません`);
      return body;
    },
  },
});
