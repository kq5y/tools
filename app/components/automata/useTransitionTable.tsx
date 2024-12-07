import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { type Transition } from "./types";

interface TransitionTableReturn {
  transitions: Transition[];
  setTransitions: Dispatch<SetStateAction<Transition[]>>;
  nodesById: {
    [key: number]: Transition;
  };
  outputKeys: string[];
  setOutputKeys: (vals: string[]) => void;
  isNFA: boolean;
  setIsNFA: (val: boolean) => void;
}

export default function useTransitionTable(
  defaultIsNFA: boolean = false
): TransitionTableReturn {
  const [isNFA, _setIsNFA] = useState<boolean>(defaultIsNFA);
  const [outputKeys, setOutputKeys] = useState<string[]>(["a", "b"]);
  const fullOutputKeys = useMemo(() => {
    return [...(isNFA ? ["ε"] : []), ...outputKeys];
  }, [outputKeys, isNFA]);
  const setFullOutputKeys = (vals: string[]) => {
    setOutputKeys(vals.filter((val) => !isNFA || val !== "ε"));
  };
  const defaultTransitions = [
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
  const setIsNFA = (val: boolean) => {
    if (val !== isNFA) {
      if (isNFA) {
        if (!confirm("Transitions will be reset.")) {
          return;
        }
        setTransitions(defaultTransitions);
      }
      _setIsNFA(val);
    }
  };
  const [transitions, setTransitions] =
    useState<Transition[]>(defaultTransitions);
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
  };
}
