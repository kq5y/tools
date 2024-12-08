import elkLayouts from "@mermaid-js/layout-elk";
import type { MetaFunction } from "@remix-run/cloudflare";
import mermaid from "mermaid";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  type Transition,
  TransitionTable,
  useTransitionTable,
} from "~/components/automata";
import {
  getMermaidFromTransitions,
  nfa2dfa,
} from "~/components/automata/utils";
import { getMeta } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("automata", "nfa2dfa");
};

export default function NFA2DFA() {
  const {
    transitions,
    setTransitions,
    outputKeys,
    setOutputKeys,
    isNFA,
    nodesById,
  } = useTransitionTable(true);
  const previewNFARef = useRef<HTMLPreElement>(null);
  const previewDFARef = useRef<HTMLPreElement>(null);
  const dfaConvertable = useMemo(() => {
    const nodes = new Set<string>();
    const nodeIds = new Set<number>();
    const targetNodeIds = new Set<number>();
    let initialCount = 0;
    let finalCount = 0;
    for (const tran of transitions) {
      if (tran.node === "") return false;
      if (nodes.has(tran.node)) return false;
      if (nodeIds.has(tran.id)) return false;
      if (tran.initial) initialCount++;
      if (tran.final) finalCount++;
      nodes.add(tran.node);
      nodeIds.add(tran.id);
      for (const key of outputKeys) {
        for (const nid of tran.outputs[key] || []) {
          targetNodeIds.add(nid);
        }
      }
    }
    if (initialCount !== 1) return false;
    if (finalCount <= 0) return false;
    if (targetNodeIds.difference(nodeIds).size > 0) return false;
    return true;
  }, [transitions, outputKeys]);
  const getPreviewNFAMermaid = useCallback(() => {
    return getMermaidFromTransitions(transitions, outputKeys);
  }, [transitions, outputKeys]);
  const getPreviewDFAMermaid = useCallback(() => {
    const { dfaTransitions } = nfa2dfa(transitions, outputKeys, nodesById);
    return getMermaidFromTransitions(dfaTransitions, outputKeys, true);
  }, [transitions, outputKeys, nodesById]);
  const convertDFA = async () => {
    if (previewNFARef.current && previewDFARef.current) {
      const previewNFA = getPreviewNFAMermaid();
      const previewDFA = getPreviewDFAMermaid();
      previewNFARef.current.innerHTML = previewNFA;
      previewNFARef.current.removeAttribute("data-processed");
      previewDFARef.current.innerHTML = previewDFA;
      previewDFARef.current.removeAttribute("data-processed");
      await mermaid.run({
        nodes: [previewNFARef.current, previewDFARef.current],
      });
    }
  };
  useEffect(() => {
    mermaid.registerLayoutLoaders(elkLayouts);
    mermaid.initialize({
      startOnLoad: false,
      layout: "elk",
      elk: {
        nodePlacementStrategy: "NETWORK_SIMPLEX",
        cycleBreakingStrategy: "MODEL_ORDER",
      },
    });
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">NFA to DFA</h1>
      <TransitionTable
        transitions={transitions}
        setTransitions={setTransitions}
        outputKeys={outputKeys}
        setOutputKeys={setOutputKeys}
        nodesById={nodesById}
        isNFA={isNFA}
      >
        <button
          type="button"
          className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          disabled={!dfaConvertable}
          onClick={convertDFA}
        >
          Convert
        </button>
      </TransitionTable>
      <div className="my-2">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 flex flex-col items-center min-w-52">
            <span>NFA</span>
            <pre
              className="flex-1 flex flex-row items-center"
              ref={previewNFARef}
            />
          </div>
          <div className="flex-1 flex flex-col items-center min-w-52">
            <span>DFA</span>
            <pre
              className="flex-1 flex flex-row items-center"
              ref={previewDFARef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
