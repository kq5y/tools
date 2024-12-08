import elkLayouts from "@mermaid-js/layout-elk";
import type { MetaFunction } from "@remix-run/cloudflare";
import mermaid from "mermaid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TransitionTable, useTransitionTable } from "~/components/automata";
import {
  dfa2simplest,
  getMermaidFromTransitions,
} from "~/components/automata/utils";
import { getMeta } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("automata", "simplest");
};

export default function Simplest() {
  const previewAutomataRef = useRef<HTMLPreElement>(null);
  const previewSimplestAutomataRef = useRef<HTMLPreElement>(null);
  const [equivalentGroupConverts, setEquivalentGroupConverts] = useState<
    string[]
  >([]);
  const dfaHook = useTransitionTable(false);
  const simplestHook = useTransitionTable(false);
  const simplestGeneratable = useMemo(() => {
    const nodes = new Set<string>();
    const nodeIds = new Set<number>();
    const targetNodeIds = new Set<number>();
    let initialCount = 0;
    let finalCount = 0;
    for (const tran of dfaHook.transitions) {
      if (tran.node === "") return false;
      if (nodes.has(tran.node)) return false;
      if (nodeIds.has(tran.id)) return false;
      if (tran.initial) initialCount++;
      if (tran.final) finalCount++;
      nodes.add(tran.node);
      nodeIds.add(tran.id);
      for (const key of dfaHook.outputKeys) {
        if ((tran.outputs[key] || []).length !== 1) return false;
        targetNodeIds.add(tran.outputs[key][0]);
      }
    }
    if (initialCount !== 1) return false;
    if (finalCount <= 0) return false;
    if (targetNodeIds.difference(nodeIds).size > 0) return false;
    return true;
  }, [dfaHook.transitions, dfaHook.outputKeys]);
  const getPreviewAutomataMermaid = useCallback(() => {
    return getMermaidFromTransitions(dfaHook.transitions, dfaHook.outputKeys);
  }, [dfaHook.transitions, dfaHook.outputKeys]);
  const getPreviewSimplestAutomataMermaid = useCallback(() => {
    const { simplestTransitions, groupStrings } = dfa2simplest(
      dfaHook.transitions,
      dfaHook.outputKeys,
      dfaHook.nodesById
    );
    setEquivalentGroupConverts(groupStrings);
    simplestHook.setOutputKeys(dfaHook.outputKeys);
    simplestHook.setTransitions(simplestTransitions);
    return getMermaidFromTransitions(simplestTransitions, dfaHook.outputKeys);
  }, [dfaHook.transitions, dfaHook.outputKeys, dfaHook.nodesById]);
  const generateSimplest = async () => {
    if (previewAutomataRef.current && previewSimplestAutomataRef.current) {
      const preview = getPreviewAutomataMermaid();
      const previewSimplest = getPreviewSimplestAutomataMermaid();
      previewAutomataRef.current.innerHTML = preview;
      previewAutomataRef.current.removeAttribute("data-processed");
      previewSimplestAutomataRef.current.innerHTML = previewSimplest;
      previewSimplestAutomataRef.current.removeAttribute("data-processed");
      await mermaid.run({
        nodes: [previewAutomataRef.current, previewSimplestAutomataRef.current],
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
      <h1 className="text-2xl font-bold">Simplest DFA</h1>
      <TransitionTable hook={dfaHook}>
        <button
          type="button"
          className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          onClick={generateSimplest}
          disabled={!simplestGeneratable}
        >
          Generate
        </button>
      </TransitionTable>
      <div className="my-2">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 flex flex-col items-center min-w-52">
            <span>DFA</span>
            <pre
              className="flex-1 flex flex-row items-center"
              ref={previewAutomataRef}
            />
          </div>
          <div className="flex-1 flex flex-col items-center min-w-52">
            <span>Simplest DFA</span>
            <pre
              className="flex-1 flex flex-row items-center"
              ref={previewSimplestAutomataRef}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {equivalentGroupConverts.map((conv, idx) => (
          <span key={idx.toString()}>
            P{idx} = {conv}
          </span>
        ))}
      </div>
      <TransitionTable hook={simplestHook} readOnly />
    </div>
  );
}
