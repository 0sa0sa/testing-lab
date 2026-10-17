export type Value = string | number | boolean;

export type InputDef =
  | { type: 'enum'; values: string[] }
  | { type: 'bool' }
  | { type: 'int' };

export type OutputType = 'int' | 'string' | 'bool';

/** 期待値。null は「その出力が存在しないこと」を表す */
export type Expected = Record<string, Value | null>;

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

export interface Spec {
  file: string;
  feature: string;
  binding: string;
  layers: string[];
  inputs: Record<string, InputDef>;
  outputs: Record<string, OutputType>;
  base: Record<string, Value>;
  decisionTables: DecisionTable[];
  boundaries: BoundaryTable[];
}

export interface Case {
  id: string;
  source: string; // 由来（どの表のどの行か）
  input: Record<string, Value>;
  expected: Expected;
  note: string;
}

export interface Diagnostic {
  level: 'error' | 'warning';
  line?: number;
  message: string;
}
