import { useCallback, useMemo, useState } from "react";
import type {
  EditorModeType,
  Transition,
  TransitionTableHookReturn,
} from "./types";

export default function useTransitionTable(
  defaultIsNFA = false,
  defaultTransitions: Transition[] | undefined = undefined,
  defaultTableString: string | undefined = undefined
): TransitionTableHookReturn {
  const [isNFA, _setIsNFA] = useState<boolean>(defaultIsNFA);
  const [outputKeys, setOutputKeys] = useState<string[]>(["a", "b"]);
  const [editorMode, setEditorMode] = useState<EditorModeType>("table");
  const [textEditorString, setTextEditorString] = useState(
    defaultTableString || ""
  );
  const fullOutputKeys = useMemo(() => {
    return [...(isNFA ? ["ε"] : []), ...outputKeys];
  }, [outputKeys, isNFA]);
  const setFullOutputKeys = (vals: string[]) => {
    setOutputKeys(vals.filter((val) => !isNFA || val !== "ε"));
  };
  const defaultTransitionsReal = defaultTransitions || [
    {
      id: 0,
      node: "q_0",
      initial: true,
      final: false,
      outputs: fullOutputKeys.reduce(
        (acc, key) => {
          acc[key] = [];
          return acc;
        },
        {} as { [key: string]: number[] }
      ),
    },
  ];
  const setIsNFA = useCallback(
    (val: boolean) => {
      if (val !== isNFA) {
        if (isNFA) {
          if (!confirm("Transitions will be reset.")) {
            return;
          }
          setTransitions(defaultTransitionsReal);
        }
        _setIsNFA(val);
      }
    },
    [isNFA]
  );
  const [transitions, setTransitions] = useState<Transition[]>(
    defaultTransitionsReal
  );
  const nodesById = useMemo(() => {
    return transitions.reduce(
      (acc, tran) => {
        acc[tran.id] = tran;
        return acc;
      },
      {} as { [key: number]: Transition }
    );
  }, [transitions]);
  return {
    transitions,
    setTransitions,
    nodesById,
    outputKeys: fullOutputKeys,
    setOutputKeys: setFullOutputKeys,
    isNFA,
    setIsNFA,
    editorMode,
    setEditorMode,
    textEditorString,
    setTextEditorString,
  };
}
