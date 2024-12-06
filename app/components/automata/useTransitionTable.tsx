import { type ReactNode, useState } from "react";
import TransitionTable from "./TransitionTable";
import { Transition } from "./types";

export default function useTransitionTable(isNFA: boolean = false) {
  const [outputKeys, setOutputKeys] = useState<string[]>(
    isNFA ? ["ε", "a", "b"] : ["a", "b"]
  );
  const [transitions, setTransitions] = useState<Transition[]>([
    {
      id: 0,
      node: "",
      initial: true,
      final: false,
      outputs: outputKeys.reduce(
        (acc, key) => {
          acc[key] = [];
          return acc;
        },
        {} as { [key: string]: number[] }
      ),
    },
  ]);
  const element = (props: { children?: ReactNode }) => {
    return (
      <TransitionTable
        transitions={transitions}
        setTransitions={setTransitions}
        outputKeys={outputKeys}
        setOutputKeys={setOutputKeys}
        isNFA={isNFA}
        additionalButtonElement={props.children}
      />
    );
  };
  return {
    TransitionTable: element,
    transitions,
    setTransitions,
    outputKeys,
    setOutputKeys,
  };
}
