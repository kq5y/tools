import elkLayouts from "@mermaid-js/layout-elk";
import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import mermaid from "mermaid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "~/components/Button";
import { TransitionTable, useTransitionTable } from "~/components/automata";
import ForwardButton from "~/components/automata/ForwardButton";
import {
  dfa2simplest,
  getMermaidFromTransitions,
} from "~/components/automata/utils";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("automata", "simplest");
};

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  return Response.json({ query });
};

export default function Simplest() {
  const { query: defaultTableString } = useLoaderData<{
    query: string | null;
  }>();
  const previewAutomataRef = useRef<HTMLPreElement>(null);
  const previewSimplestAutomataRef = useRef<HTMLPreElement>(null);
  const [equivalentGroupConverts, setEquivalentGroupConverts] = useState<
    string[]
  >([]);
  const dfaHook = useTransitionTable(
    false,
    undefined,
    decodeURIComponent(defaultTableString || "")
  );
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
      <h1 className="text-2xl font-bold">{getTitle("automata", "simplest")}</h1>
      <TransitionTable hook={dfaHook}>
        <Button onClick={generateSimplest} disabled={!simplestGeneratable}>
          Generate
        </Button>
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
            P_{idx} &= {conv.replaceAll("[", "{").replaceAll("]", "}")}{" "}
            {idx !== equivalentGroupConverts.length - 1 ? " \\" : ""}
          </span>
        ))}
      </div>
      <TransitionTable hook={simplestHook} readOnly>
        <ForwardButton
          type="typst"
          isNFA={simplestHook.isNFA}
          textEditorString={simplestHook.textEditorString}
        />
      </TransitionTable>
    </div>
  );
}
