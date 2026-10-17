// 自動生成ファイルです。手で編集しないでください。元: shipping.qa.md
// 再生成: npm run qa:gen
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import binding from "./../shipping.binding.ts";

const cases = [
  { id: "R1[範囲外下,gold,Y]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":true,"subtotal":0}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外下,gold,N]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":false,"subtotal":0}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外下,regular,Y]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":true,"subtotal":0}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外下,regular,N]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":false,"subtotal":0}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,gold,Y]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":true,"subtotal":100001}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,gold,N]", source: "decision: 送料ルール / R1", input: {"member":"gold","island":false,"subtotal":100001}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,regular,Y]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":true,"subtotal":100001}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R1[範囲外上,regular,N]", source: "decision: 送料ルール / R1", input: {"member":"regular","island":false,"subtotal":100001}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "R2[有料,gold,Y]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":true,"subtotal":2500}, expected: {"shipping":0,"error":null} },
  { id: "R2[有料,gold,N]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":false,"subtotal":2500}, expected: {"shipping":0,"error":null} },
  { id: "R2[無料,gold,Y]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":true,"subtotal":52500}, expected: {"shipping":0,"error":null} },
  { id: "R2[無料,gold,N]", source: "decision: 送料ルール / R2", input: {"member":"gold","island":false,"subtotal":52500}, expected: {"shipping":0,"error":null} },
  { id: "R3", source: "decision: 送料ルール / R3", input: {"member":"regular","island":false,"subtotal":2500}, expected: {"shipping":500,"error":null} },
  { id: "R4", source: "decision: 送料ルール / R4", input: {"member":"regular","island":true,"subtotal":2500}, expected: {"shipping":1500,"error":null} },
  { id: "R5", source: "decision: 送料ルール / R5", input: {"member":"regular","island":false,"subtotal":52500}, expected: {"shipping":0,"error":null} },
  { id: "R6", source: "decision: 送料ルール / R6", input: {"member":"regular","island":true,"subtotal":52500}, expected: {"shipping":1000,"error":null} },
  { id: "subtotal=0", source: "boundary: subtotal / 範囲外下", input: {"member":"regular","island":false,"subtotal":0}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
  { id: "subtotal=1", source: "boundary: subtotal / 有料", input: {"member":"regular","island":false,"subtotal":1}, expected: {"shipping":500,"error":null} },
  { id: "subtotal=4999", source: "boundary: subtotal / 有料", input: {"member":"regular","island":false,"subtotal":4999}, expected: {"shipping":500,"error":null} },
  { id: "subtotal=5000", source: "boundary: subtotal / 無料", input: {"member":"regular","island":false,"subtotal":5000}, expected: {"shipping":0,"error":null} },
  { id: "subtotal=100000", source: "boundary: subtotal / 無料", input: {"member":"regular","island":false,"subtotal":100000}, expected: {"shipping":0,"error":null} },
  { id: "subtotal=100001", source: "boundary: subtotal / 範囲外上", input: {"member":"regular","island":false,"subtotal":100001}, expected: {"shipping":null,"error":"INVALID_SUBTOTAL"} },
];

for (const layer of ["unit","http"] as const) {
  describe("送料計算" + ' [' + layer + ']', () => {
    const driver = binding[layer];
    before(async () => driver.setup?.());
    after(async () => driver.teardown?.());
    for (const c of cases) {
      test(c.id + '  (' + c.source + ')', async () => {
        const actual = await driver.run(c.input);
        const picked = Object.fromEntries(Object.keys(c.expected).map((k) => [k, actual[k] ?? null]));
        assert.deepEqual(picked, c.expected);
      });
    }
  });
}
