// binding: 仕様の「入力」「出力」と、実際の呼び出し方をつなぐ層
// 機能ごとに 1 回だけ人が書く。以降はケースが増えても触らない
import type { Value } from './types.ts';

export type Result = Record<string, Value | undefined>;

export interface Driver {
  setup?: () => Promise<void> | void;
  teardown?: () => Promise<void> | void;
  /** 状態を持たない機能: 仕様の入力を受け取り、仕様の出力名をキーにした結果を返す */
  run?: (input: Record<string, Value>) => Promise<Result>;
  /** 状態遷移: 新しい対象を 1 つ作り、イベントを送る関数を返す。送るたびに結果（state など）を返す */
  start?: (input: Record<string, Value>) => Promise<(event: string) => Promise<Result>>;
}

export const defineBinding = <K extends string>(b: Record<K, Driver>): Record<K, Driver> => b;
