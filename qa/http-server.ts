// binding 共通: テスト用にデモサーバーを空きポートで起動する
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../src/server.ts';

export function testServer() {
  let server: Server | undefined;
  let baseUrl = '';
  return {
    setup: () =>
      new Promise<void>((ok) => {
        server = createApp().listen(0, () => {
          baseUrl = `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
          ok();
        });
      }),
    teardown: () => new Promise<void>((ok) => (server ? server.close(() => ok()) : ok())),
    post: async (path: string, body?: unknown) => {
      const res = await fetch(baseUrl + path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: res.status, body: (await res.json()) as Record<string, never> };
    },
  };
}
