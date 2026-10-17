// 自動生成ファイルです。手で編集しないでください。元: order.qa.md
// 再生成: npm run qa:gen
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import binding from "./../order.binding.ts";

type Expected = Record<string, unknown>;
interface Case {
  id: string;
  source: string;
  input: Record<string, unknown>;
  expected: Expected;
  steps?: { event: string; expected: Expected }[];
}

const cases: Case[] = [
  { id: "cart -checkout-> pending -pay-> paid", source: "state: 注文ライフサイクル / 有効遷移", input: {}, expected: {"state":"paid","error":null}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}}] },
  { id: "cart -checkout-> pending -cancel-> cancelled", source: "state: 注文ライフサイクル / 有効遷移", input: {}, expected: {"state":"cancelled","error":null}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"cancel","expected":{"state":"cancelled","error":null}}] },
  { id: "pending -pay-> paid -ship-> shipped", source: "state: 注文ライフサイクル / 有効遷移", input: {}, expected: {"state":"shipped","error":null}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}}] },
  { id: "pending -pay-> paid -cancel-> refunded", source: "state: 注文ライフサイクル / 有効遷移", input: {}, expected: {"state":"refunded","error":null}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"cancel","expected":{"state":"refunded","error":null}}] },
  { id: "paid -ship-> shipped -deliver-> delivered", source: "state: 注文ライフサイクル / 有効遷移", input: {}, expected: {"state":"delivered","error":null}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"deliver","expected":{"state":"delivered","error":null}}] },
  { id: "cart ×pay", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cart","error":"INVALID_TRANSITION"}, steps: [{"event":"pay","expected":{"state":"cart","error":"INVALID_TRANSITION"}}] },
  { id: "cart ×cancel", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cart","error":"INVALID_TRANSITION"}, steps: [{"event":"cancel","expected":{"state":"cart","error":"INVALID_TRANSITION"}}] },
  { id: "cart ×ship", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cart","error":"INVALID_TRANSITION"}, steps: [{"event":"ship","expected":{"state":"cart","error":"INVALID_TRANSITION"}}] },
  { id: "cart ×deliver", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cart","error":"INVALID_TRANSITION"}, steps: [{"event":"deliver","expected":{"state":"cart","error":"INVALID_TRANSITION"}}] },
  { id: "pending ×checkout", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"pending","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"checkout","expected":{"state":"pending","error":"INVALID_TRANSITION"}}] },
  { id: "pending ×ship", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"pending","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"ship","expected":{"state":"pending","error":"INVALID_TRANSITION"}}] },
  { id: "pending ×deliver", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"pending","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"deliver","expected":{"state":"pending","error":"INVALID_TRANSITION"}}] },
  { id: "paid ×checkout", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"paid","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"checkout","expected":{"state":"paid","error":"INVALID_TRANSITION"}}] },
  { id: "paid ×pay", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"paid","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"pay","expected":{"state":"paid","error":"INVALID_TRANSITION"}}] },
  { id: "paid ×deliver", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"paid","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"deliver","expected":{"state":"paid","error":"INVALID_TRANSITION"}}] },
  { id: "shipped ×checkout", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"shipped","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"checkout","expected":{"state":"shipped","error":"INVALID_TRANSITION"}}] },
  { id: "shipped ×pay", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"shipped","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"pay","expected":{"state":"shipped","error":"INVALID_TRANSITION"}}] },
  { id: "shipped ×cancel", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"shipped","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"cancel","expected":{"state":"shipped","error":"INVALID_TRANSITION"}}] },
  { id: "shipped ×ship", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"shipped","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"ship","expected":{"state":"shipped","error":"INVALID_TRANSITION"}}] },
  { id: "delivered ×checkout", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"delivered","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"deliver","expected":{"state":"delivered","error":null}},{"event":"checkout","expected":{"state":"delivered","error":"INVALID_TRANSITION"}}] },
  { id: "delivered ×pay", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"delivered","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"deliver","expected":{"state":"delivered","error":null}},{"event":"pay","expected":{"state":"delivered","error":"INVALID_TRANSITION"}}] },
  { id: "delivered ×cancel", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"delivered","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"deliver","expected":{"state":"delivered","error":null}},{"event":"cancel","expected":{"state":"delivered","error":"INVALID_TRANSITION"}}] },
  { id: "delivered ×ship", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"delivered","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"deliver","expected":{"state":"delivered","error":null}},{"event":"ship","expected":{"state":"delivered","error":"INVALID_TRANSITION"}}] },
  { id: "delivered ×deliver", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"delivered","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"ship","expected":{"state":"shipped","error":null}},{"event":"deliver","expected":{"state":"delivered","error":null}},{"event":"deliver","expected":{"state":"delivered","error":"INVALID_TRANSITION"}}] },
  { id: "cancelled ×checkout", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cancelled","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"cancel","expected":{"state":"cancelled","error":null}},{"event":"checkout","expected":{"state":"cancelled","error":"INVALID_TRANSITION"}}] },
  { id: "cancelled ×pay", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cancelled","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"cancel","expected":{"state":"cancelled","error":null}},{"event":"pay","expected":{"state":"cancelled","error":"INVALID_TRANSITION"}}] },
  { id: "cancelled ×cancel", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cancelled","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"cancel","expected":{"state":"cancelled","error":null}},{"event":"cancel","expected":{"state":"cancelled","error":"INVALID_TRANSITION"}}] },
  { id: "cancelled ×ship", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cancelled","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"cancel","expected":{"state":"cancelled","error":null}},{"event":"ship","expected":{"state":"cancelled","error":"INVALID_TRANSITION"}}] },
  { id: "cancelled ×deliver", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"cancelled","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"cancel","expected":{"state":"cancelled","error":null}},{"event":"deliver","expected":{"state":"cancelled","error":"INVALID_TRANSITION"}}] },
  { id: "refunded ×checkout", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"refunded","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"cancel","expected":{"state":"refunded","error":null}},{"event":"checkout","expected":{"state":"refunded","error":"INVALID_TRANSITION"}}] },
  { id: "refunded ×pay", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"refunded","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"cancel","expected":{"state":"refunded","error":null}},{"event":"pay","expected":{"state":"refunded","error":"INVALID_TRANSITION"}}] },
  { id: "refunded ×cancel", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"refunded","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"cancel","expected":{"state":"refunded","error":null}},{"event":"cancel","expected":{"state":"refunded","error":"INVALID_TRANSITION"}}] },
  { id: "refunded ×ship", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"refunded","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"cancel","expected":{"state":"refunded","error":null}},{"event":"ship","expected":{"state":"refunded","error":"INVALID_TRANSITION"}}] },
  { id: "refunded ×deliver", source: "state: 注文ライフサイクル / 無効遷移", input: {}, expected: {"state":"refunded","error":"INVALID_TRANSITION"}, steps: [{"event":"checkout","expected":{"state":"pending","error":null}},{"event":"pay","expected":{"state":"paid","error":null}},{"event":"cancel","expected":{"state":"refunded","error":null}},{"event":"deliver","expected":{"state":"refunded","error":"INVALID_TRANSITION"}}] },
];

/** 期待値に書かれた出力だけを取り出す。値がない出力は null */
const pick = (actual: Record<string, unknown>, expected: Expected) =>
  Object.fromEntries(Object.keys(expected).map((k) => [k, actual[k] ?? null]));

for (const layer of ["unit","http"] as const) {
  describe("注文の状態" + ' [' + layer + ']', () => {
    const driver = binding[layer];
    before(async () => driver.setup?.());
    after(async () => driver.teardown?.());
    for (const c of cases) {
      test(c.id + '  (' + c.source + ')', async () => {
        if (!c.steps) {
          if (!driver.run) throw new Error('binding の ' + layer + ' に run がありません');
          assert.deepEqual(pick(await driver.run(c.input as never), c.expected), c.expected);
          return;
        }
        if (!driver.start) throw new Error('binding の ' + layer + ' に start がありません');
        const send = await driver.start(c.input as never);
        for (const [i, s] of c.steps.entries()) {
          const actual = pick(await send(s.event), s.expected);
          assert.deepEqual(actual, s.expected, (i + 1) + ' 番目のイベント ' + s.event + ' の結果が違います');
        }
      });
    }
  });
}
