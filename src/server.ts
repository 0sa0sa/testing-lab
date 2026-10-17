// デモアプリ: HTTP API
//   POST /shipping-fee            {member, island, subtotal, payment} → 200 {shipping, fee} / 400 {error}
//   POST /orders                  → 201 {id, state}
//   POST /orders/:id/events       {event} → 200 {state} / 409 {state, error: INVALID_TRANSITION}
import { createServer, type Server } from 'node:http';
import { calcShipping } from './shipping.ts';
import { InvalidTransition, Order } from './order.ts';

export function createApp(): Server {
  const orders = new Map<string, Order>();
  let seq = 0;

  return createServer(async (req, res) => {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    let raw = '';
    for await (const chunk of req) raw += chunk;
    let body: Record<string, unknown> = {};
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error();
        body = parsed;
      } catch {
        return send(400, { error: 'BAD_REQUEST' });
      }
    }
    if (req.method !== 'POST') return send(404, { error: 'NOT_FOUND' });

    if (req.url === '/shipping-fee') {
      const result = calcShipping(body);
      return send('error' in result ? 400 : 200, result);
    }
    if (req.url === '/orders') {
      const id = String(++seq);
      const order = new Order();
      orders.set(id, order);
      return send(201, { id, state: order.state });
    }
    const m = req.url?.match(/^\/orders\/(\w+)\/events$/);
    if (m) {
      const order = orders.get(m[1]);
      if (!order) return send(404, { error: 'NOT_FOUND' });
      try {
        return send(200, { state: order.dispatch(String(body.event)) });
      } catch (e) {
        if (e instanceof InvalidTransition) return send(409, { state: order.state, error: 'INVALID_TRANSITION' });
        throw e;
      }
    }
    send(404, { error: 'NOT_FOUND' });
  });
}

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => console.log(`listening on :${port}`));
}
