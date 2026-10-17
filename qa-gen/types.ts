/** 入力・出力の値。入力の null は JSON の null、期待値の null は「その出力がないこと」 */
export type Value = string | number | boolean | null;

export type InputDef =
  | { type: 'enum'; values: string[] }
  | { type: 'bool' }
  | { type: 'int' };

export type OutputType = 'int' | 'string' | 'bool';

export type Expected = Record<string, Value>;

/** 同値分割の値セル 1 つ分。missing は「キー自体を送らない」 */
export type Literal = { v: Value } | { missing: true };

export interface Partition {
  name: string;
  min?: number;
  max?: number;
  expected: Expected;
  note: string;
  line: number;
}

export interface BoundaryTable {
  input: string;
  partitions: Partition[];
  line: number;
}

export interface Rule {
  id: string;
  conds: Record<string, string>; // 列名 → セルの文字列
  expected: Expected;
  note: string;
  line: number;
}

export interface DecisionTable {
  name: string;
  conditions: string[];
  rules: Rule[];
  line: number;
}

export interface EqClass {
  input: string;
  name: string;
  valid: boolean;
  values: Literal[];
  expected: Expected;
  note: string;
  line: number;
}

export interface EquivalenceTable {
  name: string;
  classes: EqClass[];
  line: number;
}

export interface PairwiseTable {
  name: string;
  factors: { input: string; levels: string; line: number }[]; // levels はセルの文字列（"-" = 全部）
  line: number;
}

export interface Transition {
  from: string;
  event: string;
  to: string;
  line: number;
}

export interface StateMachine {
  name: string;
  switches: number; // N スイッチ網羅の N
  initial?: string;
  states: string[];
  labels: Record<string, string>;
  events: string[];
  transitions: Transition[];
  line: number;
}

export interface Spec {
  file: string;
  feature: string;
  binding: string;
  layers: string[];
  inputs: Record<string, InputDef>;
  outputs: Record<string, OutputType>;
  base: Record<string, Value>;
  /** 無効な遷移の期待値（state は自動で「元の状態のまま」） */
  invalidEvent?: Expected;
  decisionTables: DecisionTable[];
  boundaries: BoundaryTable[];
  equivalences: EquivalenceTable[];
  pairwise: PairwiseTable[];
  stateMachines: StateMachine[];
}

export interface Case {
  id: string;
  source: string; // 由来（どの表のどの行か）
  /** キーがない入力は「送らない」 */
  input: Record<string, Value>;
  /** 状態遷移: 順に送るイベントと、各イベント後の期待値 */
  steps?: Step[];
  /** steps のうち末尾いくつが検査対象の遷移か（残りは前置きの経路） */
  focus?: number;
  expected: Expected;
  note: string;
  line?: number;
}

export interface Step {
  event: string;
  expected: Expected;
}

export interface ExpandResult {
  cases: Case[];
  /** cases.md に載せる、表ごとの要約（キー = Case.source の「/」より前） */
  summaries: Record<string, string[]>;
}

export interface Diagnostic {
  level: 'error' | 'warning';
  line?: number;
  message: string;
}
