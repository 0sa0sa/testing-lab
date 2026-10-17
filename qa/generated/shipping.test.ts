// 自動生成ファイルです。手で編集しないでください。元: shipping.qa.md
// 再生成: npm run qa:gen
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import binding from "./../shipping.binding.ts";

type Expected = Record<string, unknown>;
interface Case {
  id: string;
  source: string;
  input: Record<string, unknown>;
  expected: Expected;
  steps?: { event: string; expected: Expected }[];
}

const cases: Case[] = [
  { id: "R1[範囲外下,gold,Y]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":true,"subtotal":0,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外下,gold,N]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":false,"subtotal":0,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外下,regular,Y]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":true,"subtotal":0,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外下,regular,N]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":false,"subtotal":0,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,gold,Y]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":true,"subtotal":100001,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,gold,N]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":false,"subtotal":100001,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,regular,Y]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":true,"subtotal":100001,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,regular,N]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":false,"subtotal":100001,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R2[有料,gold,Y]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":true,"subtotal":2500,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R2[有料,gold,N]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":false,"subtotal":2500,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R2[無料,gold,Y]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":true,"subtotal":7499,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R2[無料,gold,N]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":false,"subtotal":7499,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R2[高額,gold,Y]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":true,"subtotal":55000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R2[高額,gold,N]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":false,"subtotal":55000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R3", source: "decision: 送料ルール / R3", input: {"member":"regular","island":false,"subtotal":2500,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "R4", source: "decision: 送料ルール / R4", input: {"member":"regular","island":true,"subtotal":2500,"payment":"card"}, expected: {"shipping":1500,"fee":0,"error":null} },
  { id: "R5[無料,regular,N]", source: "decision: 送料ルール / R5", input: {"member":"regular","island":false,"subtotal":7499,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R5[高額,regular,N]", source: "decision: 送料ルール / R5", input: {"member":"regular","island":false,"subtotal":55000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "R6[無料,regular,Y]", source: "decision: 送料ルール / R6", input: {"member":"regular","island":true,"subtotal":7499,"payment":"card"}, expected: {"shipping":1000,"fee":0,"error":null} },
  { id: "R6[高額,regular,Y]", source: "decision: 送料ルール / R6", input: {"member":"regular","island":true,"subtotal":55000,"payment":"card"}, expected: {"shipping":1000,"fee":0,"error":null} },
  { id: "F1[範囲外下,card]", source: "decision: 手数料ルール / F1", input: {"member":"regular","island":false,"subtotal":0,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "F1[範囲外下,konbini]", source: "decision: 手数料ルール / F1", input: {"member":"regular","island":false,"subtotal":0,"payment":"konbini"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "F1[範囲外下,cod]", source: "decision: 手数料ルール / F1", input: {"member":"regular","island":false,"subtotal":0,"payment":"cod"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "F1[範囲外上,card]", source: "decision: 手数料ルール / F1", input: {"member":"regular","island":false,"subtotal":100001,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "F1[範囲外上,konbini]", source: "decision: 手数料ルール / F1", input: {"member":"regular","island":false,"subtotal":100001,"payment":"konbini"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "F1[範囲外上,cod]", source: "decision: 手数料ルール / F1", input: {"member":"regular","island":false,"subtotal":100001,"payment":"cod"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "F2[有料,card]", source: "decision: 手数料ルール / F2", input: {"member":"regular","island":false,"subtotal":2500,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "F2[有料,konbini]", source: "decision: 手数料ルール / F2", input: {"member":"regular","island":false,"subtotal":2500,"payment":"konbini"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "F2[無料,card]", source: "decision: 手数料ルール / F2", input: {"member":"regular","island":false,"subtotal":7499,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "F2[無料,konbini]", source: "decision: 手数料ルール / F2", input: {"member":"regular","island":false,"subtotal":7499,"payment":"konbini"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "F2[高額,card]", source: "decision: 手数料ルール / F2", input: {"member":"regular","island":false,"subtotal":55000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "F2[高額,konbini]", source: "decision: 手数料ルール / F2", input: {"member":"regular","island":false,"subtotal":55000,"payment":"konbini"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "F3[有料,cod]", source: "decision: 手数料ルール / F3", input: {"member":"regular","island":false,"subtotal":2500,"payment":"cod"}, expected: {"shipping":500,"fee":330,"error":null} },
  { id: "F3[無料,cod]", source: "decision: 手数料ルール / F3", input: {"member":"regular","island":false,"subtotal":7499,"payment":"cod"}, expected: {"shipping":0,"fee":330,"error":null} },
  { id: "F4", source: "decision: 手数料ルール / F4", input: {"member":"regular","island":false,"subtotal":55000,"payment":"cod"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=0", source: "boundary: subtotal / 範囲外下", input: {"member":"regular","island":false,"subtotal":0,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "subtotal=1", source: "boundary: subtotal / 有料", input: {"member":"regular","island":false,"subtotal":1,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "subtotal=1/R2", source: "boundary: subtotal / 有料", input: {"member":"gold","island":false,"subtotal":1,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=1/R4", source: "boundary: subtotal / 有料", input: {"member":"regular","island":true,"subtotal":1,"payment":"card"}, expected: {"shipping":1500,"fee":0,"error":null} },
  { id: "subtotal=1/F3", source: "boundary: subtotal / 有料", input: {"member":"regular","island":false,"subtotal":1,"payment":"cod"}, expected: {"shipping":500,"fee":330,"error":null} },
  { id: "subtotal=4999", source: "boundary: subtotal / 有料", input: {"member":"regular","island":false,"subtotal":4999,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "subtotal=4999/R2", source: "boundary: subtotal / 有料", input: {"member":"gold","island":false,"subtotal":4999,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=4999/R4", source: "boundary: subtotal / 有料", input: {"member":"regular","island":true,"subtotal":4999,"payment":"card"}, expected: {"shipping":1500,"fee":0,"error":null} },
  { id: "subtotal=4999/F3", source: "boundary: subtotal / 有料", input: {"member":"regular","island":false,"subtotal":4999,"payment":"cod"}, expected: {"shipping":500,"fee":330,"error":null} },
  { id: "subtotal=5000", source: "boundary: subtotal / 無料", input: {"member":"regular","island":false,"subtotal":5000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=5000/R2", source: "boundary: subtotal / 無料", input: {"member":"gold","island":false,"subtotal":5000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=5000/R6", source: "boundary: subtotal / 無料", input: {"member":"regular","island":true,"subtotal":5000,"payment":"card"}, expected: {"shipping":1000,"fee":0,"error":null} },
  { id: "subtotal=5000/F3", source: "boundary: subtotal / 無料", input: {"member":"regular","island":false,"subtotal":5000,"payment":"cod"}, expected: {"shipping":0,"fee":330,"error":null} },
  { id: "subtotal=9999", source: "boundary: subtotal / 無料", input: {"member":"regular","island":false,"subtotal":9999,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=9999/R2", source: "boundary: subtotal / 無料", input: {"member":"gold","island":false,"subtotal":9999,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=9999/R6", source: "boundary: subtotal / 無料", input: {"member":"regular","island":true,"subtotal":9999,"payment":"card"}, expected: {"shipping":1000,"fee":0,"error":null} },
  { id: "subtotal=9999/F3", source: "boundary: subtotal / 無料", input: {"member":"regular","island":false,"subtotal":9999,"payment":"cod"}, expected: {"shipping":0,"fee":330,"error":null} },
  { id: "subtotal=10000", source: "boundary: subtotal / 高額", input: {"member":"regular","island":false,"subtotal":10000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=10000/R2", source: "boundary: subtotal / 高額", input: {"member":"gold","island":false,"subtotal":10000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=10000/R6", source: "boundary: subtotal / 高額", input: {"member":"regular","island":true,"subtotal":10000,"payment":"card"}, expected: {"shipping":1000,"fee":0,"error":null} },
  { id: "subtotal=10000/F4", source: "boundary: subtotal / 高額", input: {"member":"regular","island":false,"subtotal":10000,"payment":"cod"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=100000", source: "boundary: subtotal / 高額", input: {"member":"regular","island":false,"subtotal":100000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=100000/R2", source: "boundary: subtotal / 高額", input: {"member":"gold","island":false,"subtotal":100000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=100000/R6", source: "boundary: subtotal / 高額", input: {"member":"regular","island":true,"subtotal":100000,"payment":"card"}, expected: {"shipping":1000,"fee":0,"error":null} },
  { id: "subtotal=100000/F4", source: "boundary: subtotal / 高額", input: {"member":"regular","island":false,"subtotal":100000,"payment":"cod"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "subtotal=100001", source: "boundary: subtotal / 範囲外上", input: {"member":"regular","island":false,"subtotal":100001,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "member:会員種別=\"gold\"", source: "equivalence: member / 会員種別", input: {"member":"gold","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "member:会員種別=\"regular\"", source: "equivalence: member / 会員種別", input: {"member":"regular","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "member:未知=\"platinum\"", source: "equivalence: member / 未知", input: {"member":"platinum","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_MEMBER"} },
  { id: "member:未知=\"\"", source: "equivalence: member / 未知", input: {"member":"","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_MEMBER"} },
  { id: "member:未知=\"GOLD\"", source: "equivalence: member / 未知", input: {"member":"GOLD","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_MEMBER"} },
  { id: "member:型違い=1", source: "equivalence: member / 型違い", input: {"member":1,"island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_MEMBER"} },
  { id: "member:型違い=true", source: "equivalence: member / 型違い", input: {"member":true,"island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_MEMBER"} },
  { id: "member:型違い=null", source: "equivalence: member / 型違い", input: {"member":null,"island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_MEMBER"} },
  { id: "member:型違い=(なし)", source: "equivalence: member / 型違い", input: {"island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_MEMBER"} },
  { id: "island:真偽値=true", source: "equivalence: island / 真偽値", input: {"member":"regular","island":true,"subtotal":3000,"payment":"card"}, expected: {"shipping":1500,"fee":0,"error":null} },
  { id: "island:真偽値=false", source: "equivalence: island / 真偽値", input: {"member":"regular","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "island:型違い=\"true\"", source: "equivalence: island / 型違い", input: {"member":"regular","island":"true","subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_ISLAND"} },
  { id: "island:型違い=1", source: "equivalence: island / 型違い", input: {"member":"regular","island":1,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_ISLAND"} },
  { id: "island:型違い=null", source: "equivalence: island / 型違い", input: {"member":"regular","island":null,"subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_ISLAND"} },
  { id: "island:型違い=(なし)", source: "equivalence: island / 型違い", input: {"member":"regular","subtotal":3000,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_ISLAND"} },
  { id: "subtotal:整数=3000", source: "equivalence: subtotal / 整数", input: {"member":"regular","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "subtotal:小数=3000.5", source: "equivalence: subtotal / 小数", input: {"member":"regular","island":false,"subtotal":3000.5,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "subtotal:型違い=\"3000\"", source: "equivalence: subtotal / 型違い", input: {"member":"regular","island":false,"subtotal":"3000","payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "subtotal:型違い=null", source: "equivalence: subtotal / 型違い", input: {"member":"regular","island":false,"subtotal":null,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "subtotal:型違い=(なし)", source: "equivalence: subtotal / 型違い", input: {"member":"regular","island":false,"payment":"card"}, expected: {"shipping":null,"fee":null,"error":"INVALID_SUBTOTAL"} },
  { id: "payment:支払方法=\"card\"", source: "equivalence: payment / 支払方法", input: {"member":"regular","island":false,"subtotal":3000,"payment":"card"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "payment:支払方法=\"konbini\"", source: "equivalence: payment / 支払方法", input: {"member":"regular","island":false,"subtotal":3000,"payment":"konbini"}, expected: {"shipping":500,"fee":0,"error":null} },
  { id: "payment:支払方法=\"cod\"", source: "equivalence: payment / 支払方法", input: {"member":"regular","island":false,"subtotal":3000,"payment":"cod"}, expected: {"shipping":500,"fee":330,"error":null} },
  { id: "payment:未知=\"paypay\"", source: "equivalence: payment / 未知", input: {"member":"regular","island":false,"subtotal":3000,"payment":"paypay"}, expected: {"shipping":null,"fee":null,"error":"INVALID_PAYMENT"} },
  { id: "payment:未知=\"\"", source: "equivalence: payment / 未知", input: {"member":"regular","island":false,"subtotal":3000,"payment":""}, expected: {"shipping":null,"fee":null,"error":"INVALID_PAYMENT"} },
  { id: "payment:型違い=0", source: "equivalence: payment / 型違い", input: {"member":"regular","island":false,"subtotal":3000,"payment":0}, expected: {"shipping":null,"fee":null,"error":"INVALID_PAYMENT"} },
  { id: "payment:型違い=null", source: "equivalence: payment / 型違い", input: {"member":"regular","island":false,"subtotal":3000,"payment":null}, expected: {"shipping":null,"fee":null,"error":"INVALID_PAYMENT"} },
  { id: "payment:型違い=(なし)", source: "equivalence: payment / 型違い", input: {"member":"regular","island":false,"subtotal":3000}, expected: {"shipping":null,"fee":null,"error":"INVALID_PAYMENT"} },
  { id: "P01", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"gold","island":true,"subtotal":2500,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "P02", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"gold","island":false,"subtotal":7499,"payment":"konbini"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "P03", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"regular","island":true,"subtotal":7499,"payment":"cod"}, expected: {"shipping":1000,"fee":330,"error":null} },
  { id: "P04", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"regular","island":false,"subtotal":55000,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "P05", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"gold","island":true,"subtotal":55000,"payment":"konbini"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "P06", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"gold","island":false,"subtotal":2500,"payment":"cod"}, expected: {"shipping":0,"fee":330,"error":null} },
  { id: "P07", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"regular","island":true,"subtotal":2500,"payment":"konbini"}, expected: {"shipping":1500,"fee":0,"error":null} },
  { id: "P08", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"gold","island":true,"subtotal":7499,"payment":"card"}, expected: {"shipping":0,"fee":0,"error":null} },
  { id: "P09", source: "pairwise: 有効な入力の組み合わせ", input: {"member":"gold","island":true,"subtotal":55000,"payment":"cod"}, expected: {"shipping":0,"fee":0,"error":null} },
];

/** 期待値に書かれた出力だけを取り出す。値がない出力は null */
const pick = (actual: Record<string, unknown>, expected: Expected) =>
  Object.fromEntries(Object.keys(expected).map((k) => [k, actual[k] ?? null]));

for (const layer of ["unit","http"] as const) {
  describe("送料計算" + ' [' + layer + ']', () => {
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
