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

export interface TransitionTableHookReturn {
  transitions: Transition[];
  setTransitions: Dispatch<SetStateAction<Transition[]>>;
  nodesById: {
    [key: number]: Transition;
  };
  outputKeys: string[];
  setOutputKeys: (vals: string[]) => void;
  isNFA: boolean;
  setIsNFA: (val: boolean) => void;
  editorMode: EditorModeType;
  setEditorMode: (val: EditorModeType) => void;
  textEditorString: string;
  setTextEditorString: (val: string) => void;
}

export type EditorModeType = "table" | "text";
