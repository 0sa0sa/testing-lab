// binding: 仕様の「入力」「出力」と、実際の呼び出し方をつなぐ層
// 機能ごとに 1 回だけ人が書く。以降はケースが増えても触らない
import type { Value } from './types.ts';

export interface Driver {
  setup?: () => Promise<void> | void;
  teardown?: () => Promise<void> | void;
  /** 仕様の入力を受け取り、仕様の出力名をキーにした結果を返す */
  run: (input: Record<string, Value>) => Promise<Record<string, Value | null | undefined>>;
}

export type Binding = Record<string, Driver>;

export const defineBinding = <K extends string>(b: Record<K, Driver>): Record<K, Driver> => b;
