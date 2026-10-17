// デモアプリ: HTTP API
//   POST /shipping-fee  {member, island, subtotal}
//   200 {shipping} / 400 {error}
import { createServer, type Server } from 'node:http';
import { calcShipping, type ShippingInput } from './shipping.ts';

export function createApp(): Server {
  return createServer(async (req, res) => {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'POST' || req.url !== '/shipping-fee') return send(404, { error: 'NOT_FOUND' });

    let raw = '';
    for await (const chunk of req) raw += chunk;
    let input: ShippingInput;
    try {
      input = JSON.parse(raw);
    } catch {
      return send(400, { error: 'BAD_REQUEST' });
    }
    const result = calcShipping(input);
    send('error' in result ? 400 : 200, result);
  });
}

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => console.log(`listening on :${port}`));
}
