import elkLayouts from "@mermaid-js/layout-elk";
import type { MetaFunction } from "@remix-run/cloudflare";
import mermaid from "mermaid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Transition, useTransitionTable } from "~/components/automata";
import { getMermaidFromTransitions } from "~/components/automata/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "/automata/simplest" },
    { name: "description", content: "Convert the DFA to the simplest DFA" },
  ];
};

export default function Simplest() {
  const previewAutomataRef = useRef<HTMLPreElement>(null);
  const previewSimplestAutomataRef = useRef<HTMLPreElement>(null);
  const [equivalentGroupConverts, setEquivalentGroupConverts] = useState<
    string[]
  >([]);
  const { TransitionTable, transitions, outputKeys } =
    useTransitionTable(false);
  const simplestGeneratable = useMemo(() => {
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
        if (tran.outputs[key].length !== 1) return false;
        targetNodeIds.add(tran.outputs[key][0]);
      }
    }
    if (initialCount !== 1) return false;
    if (finalCount <= 0) return false;
    if (targetNodeIds.difference(nodeIds).size > 0) return false;
    return true;
  }, [transitions, outputKeys]);
  const getPreviewAutomataMermaid = useCallback(() => {
    return getMermaidFromTransitions(transitions, outputKeys);
  }, [transitions, outputKeys]);
  const getPreviewSimplestAutomataMermaid = useCallback(() => {
    const simplestTransitions: Transition[] = [];
    const groupStrings: string[] = [];
    const nodesById: { [key: number]: Transition } = {};
    const nodesByName: { [key: string]: number } = {};
    let equivalentGroups: number[][] = [[], []];
    for (const tran of transitions) {
      nodesById[tran.id] = tran;
      nodesByName[tran.node] = tran.id;
      if (tran.final) equivalentGroups[1].push(tran.id);
      else equivalentGroups[0].push(tran.id);
    }
    groupStrings.push(JSON.stringify(equivalentGroups));
    while (true) {
      let newGroups: number[][] = [];
      for (const group of equivalentGroups) {
        const newGroup: { [key: string]: number[] } = {};
        for (const id of group) {
          let labels = [];
          for (const key of outputKeys) {
            for (
              let searchIdx = 0;
              searchIdx < equivalentGroups.length;
              searchIdx++
            ) {
              if (
                equivalentGroups[searchIdx].includes(
                  nodesById[id].outputs[key][0]
                )
              ) {
                labels.push(searchIdx);
                break;
              }
            }
          }
          newGroup[labels.join("&&")] = newGroup[labels.join("&&")] || [];
          newGroup[labels.join("&&")].push(id);
        }
        newGroups = [...newGroups, ...Object.values(newGroup)];
      }
      groupStrings.push(JSON.stringify(newGroups));
      if (
        equivalentGroups.length === newGroups.length &&
        newGroups.every((group, i) =>
          group.every((id) => equivalentGroups[i].includes(id))
        )
      )
        break;
      equivalentGroups = newGroups;
    }
    setEquivalentGroupConverts(groupStrings);
    for (let groupIdx = 0; groupIdx < equivalentGroups.length; groupIdx++) {
      simplestTransitions.push({
        id: groupIdx,
        node: equivalentGroups[groupIdx].join(","),
        initial: equivalentGroups[groupIdx].some((id) => nodesById[id].initial),
        final: equivalentGroups[groupIdx].some((id) => nodesById[id].final),
        outputs: outputKeys.reduce(
          (acc, key) => {
            const target =
              nodesById[equivalentGroups[groupIdx][0]].outputs[key][0];
            for (
              let searchIdx = 0;
              searchIdx < equivalentGroups.length;
              searchIdx++
            ) {
              if (equivalentGroups[searchIdx].includes(target)) {
                acc[key] = [searchIdx];
                break;
              }
            }
            return acc;
          },
          {} as { [key: string]: number[] }
        ),
      });
    }
    return getMermaidFromTransitions(simplestTransitions, outputKeys);
  }, [transitions, outputKeys]);
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
      <TransitionTable>
        <button
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
          <span key={idx}>
            P{idx} = {conv}
          </span>
        ))}
      </div>
    </div>
  );
}
