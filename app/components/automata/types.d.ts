export interface Transition {
  id: number;
  node: string;
  initial: boolean;
  final: boolean;
  outputs: { [key: string]: number[] };
}

export interface FocusConfig {
  open: boolean;
  index: number;
  key: string;
  top: number;
  left: number;
}

export type EditorModeType = "table" | "text";
