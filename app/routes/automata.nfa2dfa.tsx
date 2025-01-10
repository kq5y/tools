import elkLayouts from "@mermaid-js/layout-elk";
import type { MetaFunction } from "@remix-run/cloudflare";
import mermaid from "mermaid";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Button } from "~/components/Button";
import { TransitionTable, useTransitionTable } from "~/components/automata";
import ForwardButton from "~/components/automata/ForwardButton";
import {
  getMermaidFromTransitions,
  nfa2dfa,
} from "~/components/automata/utils";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("automata", "nfa2dfa");
};

export default function NFA2DFA() {
  const nfaHook = useTransitionTable(true);
  const dfaHook = useTransitionTable(false);
  const previewNFARef = useRef<HTMLPreElement>(null);
  const previewDFARef = useRef<HTMLPreElement>(null);
  const dfaConvertable = useMemo(() => {
    const nodes = new Set<string>();
    const nodeIds = new Set<number>();
    const targetNodeIds = new Set<number>();
    let initialCount = 0;
    let finalCount = 0;
    for (const tran of nfaHook.transitions) {
      if (tran.node === "") return false;
      if (nodes.has(tran.node)) return false;
      if (nodeIds.has(tran.id)) return false;
      if (tran.initial) initialCount++;
      if (tran.final) finalCount++;
      nodes.add(tran.node);
      nodeIds.add(tran.id);
      for (const key of nfaHook.outputKeys) {
        for (const nid of tran.outputs[key] || []) {
          targetNodeIds.add(nid);
        }
      }
    }
    if (initialCount !== 1) return false;
    if (finalCount <= 0) return false;
    if (targetNodeIds.difference(nodeIds).size > 0) return false;
    return true;
  }, [nfaHook.transitions, nfaHook.outputKeys]);
  const getPreviewNFAMermaid = useCallback(() => {
    return getMermaidFromTransitions(nfaHook.transitions, nfaHook.outputKeys);
  }, [nfaHook.transitions, nfaHook.outputKeys]);
  const getPreviewDFAMermaid = useCallback(() => {
    const { dfaTransitions, outputKeys } = nfa2dfa(
      nfaHook.transitions,
      nfaHook.outputKeys,
      nfaHook.nodesById
    );
    dfaHook.setOutputKeys(outputKeys);
    dfaHook.setTransitions(dfaTransitions);
    return getMermaidFromTransitions(dfaTransitions, outputKeys, true);
  }, [nfaHook.transitions, nfaHook.outputKeys, nfaHook.nodesById]);
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
      <h1 className="text-2xl font-bold">{getTitle("automata", "nfa2dfa")}</h1>
      <TransitionTable hook={nfaHook}>
        <Button disabled={!dfaConvertable} onClick={convertDFA}>
          Convert
        </Button>
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
      <TransitionTable hook={dfaHook} readOnly>
        <ForwardButton
          type="simplest"
          textEditorString={dfaHook.textEditorString}
        />
        <ForwardButton
          type="typst"
          isNFA={dfaHook.isNFA}
          textEditorString={dfaHook.textEditorString}
        />
      </TransitionTable>
    </div>
  );
}
