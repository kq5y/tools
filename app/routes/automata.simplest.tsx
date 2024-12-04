import type { MetaFunction } from "@remix-run/cloudflare";
import mermaid from "mermaid";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "/automata/simplest" },
    { name: "description", content: "Generate the simplest automaton" },
  ];
};

interface Transition {
  id: number;
  node: string;
  initial: boolean;
  final: boolean;
  outputs: { [key: string]: string };
}

export default function Simplest() {
  const previewAutomataRef = useRef<HTMLPreElement>(null);
  const previewSimplestAutomataRef = useRef<HTMLPreElement>(null);
  const [outputKeys] = useState<string[]>(["a", "b"]);
  const [transitions, setTransitions] = useState<Transition[]>([
    {
      id: 0,
      node: "",
      initial: true,
      final: false,
      outputs: {
        a: "",
        b: "",
      },
    },
  ]);
  const lastTransitionId = useMemo(() => {
    return transitions[transitions.length - 1].id;
  }, [transitions]);
  const simplestGeneratable = useMemo(() => {
    const nodes = new Set<string>();
    const targetNodes = new Set<string>();
    let initialCount = 0;
    let finalCount = 0;
    for (const tran of transitions) {
      if (tran.node === "") return false;
      if (nodes.has(tran.node)) return false;
      if (tran.initial) initialCount++;
      if (tran.final) finalCount++;
      nodes.add(tran.node);
      for (const key of outputKeys) {
        if (tran.outputs[key] === "") return false;
        targetNodes.add(tran.outputs[key]);
      }
    }
    if (initialCount !== 1) return false;
    if (finalCount <= 0) return false;
    if (targetNodes.difference(nodes).size > 0) return false;
    return true;
  }, [transitions]);
  const getMermaidFromTransitions = (trans: Transition[]) => {
    let res = "graph LR\nstyle start fill:none, stroke:none\nstart(( ))\n";
    let initialId = -1;
    const nodes: { [key: string]: number } = {};
    for (const tran of trans) {
      if (tran.initial) initialId = tran.id;
      nodes[tran.node] = tran.id;
      if (tran.final) res += `${tran.id}(((${tran.node})))\n`;
      else res += `${tran.id}((${tran.node}))\n`;
    }
    res += `start --> ${initialId}\n`;
    for (const tran of trans) {
      const outputs = {} as { [key: string]: string[] };
      for (const key of outputKeys) {
        outputs[tran.outputs[key]] = outputs[tran.outputs[key]] || [];
        outputs[tran.outputs[key]].push(key);
      }
      for (const key of Object.keys(outputs)) {
        res += `${tran.id} -->|${outputs[key].join(",")}| ${nodes[key]}\n`;
      }
    }
    return res;
  };
  const getPreviewAutomataMermaid = useCallback(() => {
    return getMermaidFromTransitions(transitions);
  }, [transitions]);
  const getPreviewSimplestAutomataMermaid = useCallback(() => {
    const simplestTransitions: Transition[] = [];
    // group
    return getMermaidFromTransitions(simplestTransitions);
  }, [transitions]);
  const onTranNodeChange = (
    ev: ChangeEvent<HTMLInputElement>,
    target: number
  ) => {
    setTransitions(
      transitions.map((tran, idx) =>
        idx === target
          ? {
              ...tran,
              node: ev.target.value,
            }
          : tran
      )
    );
  };
  const onTranInitialChange = (
    ev: ChangeEvent<HTMLInputElement>,
    target: number
  ) => {
    setTransitions(
      transitions.map((tran, idx) =>
        idx === target
          ? {
              ...tran,
              initial: ev.target.checked,
            }
          : tran
      )
    );
  };
  const onTranFinalChange = (
    ev: ChangeEvent<HTMLInputElement>,
    target: number
  ) => {
    setTransitions(
      transitions.map((tran, idx) =>
        idx === target
          ? {
              ...tran,
              final: ev.target.checked,
            }
          : tran
      )
    );
  };
  const onTranOutputChange = (
    ev: ChangeEvent<HTMLInputElement>,
    target: number,
    key: string
  ) => {
    setTransitions(
      transitions.map((tran, idx) =>
        idx === target
          ? {
              ...tran,
              outputs: {
                ...tran.outputs,
                [key]: ev.target.value,
              },
            }
          : tran
      )
    );
  };
  const addTransition = () => {
    setTransitions([
      ...transitions,
      {
        id: lastTransitionId + 1,
        node: "",
        initial: false,
        final: false,
        outputs: outputKeys.reduce(
          (acc, key) => {
            acc[key] = "";
            return acc;
          },
          {} as { [key: string]: string }
        ),
      },
    ]);
  };
  const deleteTransition = (id: number) => {
    setTransitions(
      transitions.reduce((acc, tran) => {
        if (tran.id !== id) acc.push(tran);
        return acc;
      }, [] as Transition[])
    );
  };
  const generateSimplest = async () => {
    if (previewAutomataRef.current && previewSimplestAutomataRef.current) {
      previewAutomataRef.current.innerHTML = getPreviewAutomataMermaid();
      previewAutomataRef.current.removeAttribute("data-processed");
      previewSimplestAutomataRef.current.innerHTML =
        getPreviewSimplestAutomataMermaid();
      previewSimplestAutomataRef.current.removeAttribute("data-processed");
      await mermaid.run({
        nodes: [previewAutomataRef.current, previewSimplestAutomataRef.current],
      });
    }
  };
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      flowchart: { defaultRenderer: "elk" },
    });
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold">Simplest Automata</h1>
      <div className="p-2">
        <div className="mb-2 overflow-x-auto">
          <table className="table-auto bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="border border-gray-300 px-4 py-2"
                  rowSpan={2}
                ></th>
                <th className="border border-gray-300 px-4 py-2" rowSpan={2}>
                  Node
                </th>
                <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                  Type
                </th>
                <th
                  className="border border-gray-300 px-4 py-2"
                  colSpan={outputKeys.length}
                >
                  Output
                </th>
                <th className="border border-gray-300 px-4 py-2" rowSpan={2}>
                  Del
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">q0</th>
                <th className="border border-gray-300 px-4 py-2">F</th>
                {outputKeys.map((key) => (
                  <th className="border border-gray-300 px-4 py-2" key={key}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transitions.map((tran, index) => (
                <tr className="border-b hover:bg-gray-50" key={tran.id}>
                  <td className="border border-gray-300 text-center">
                    {tran.id}
                  </td>
                  <td className="border border-gray-300">
                    <input
                      className="px-4 py-2 w-32"
                      type="text"
                      value={tran.node}
                      onFocus={(ev) => ev.target.select()}
                      onChange={(ev) => onTranNodeChange(ev, index)}
                    />
                  </td>
                  <td className="border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      checked={tran.initial}
                      onChange={(ev) => onTranInitialChange(ev, index)}
                    />
                  </td>
                  <td className="border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      checked={tran.final}
                      onChange={(ev) => onTranFinalChange(ev, index)}
                    />
                  </td>
                  {outputKeys.map((key) => (
                    <td className="border border-gray-300" key={key}>
                      <input
                        className="px-4 py-2 w-32"
                        type="text"
                        value={tran.outputs[key]}
                        onFocus={(ev) => ev.target.select()}
                        onChange={(ev) => onTranOutputChange(ev, index, key)}
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 text-center">
                    {tran.id !== 0 && (
                      <button
                        className="font-bold text-2xl text-red-600 hover:text-red-800 transition"
                        onClick={() => deleteTransition(tran.id)}
                      >
                        x
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            onClick={addTransition}
          >
            Add Transition
          </button>
          <button
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            onClick={generateSimplest}
            disabled={!simplestGeneratable}
          >
            Generate
          </button>
        </div>
        <div className="flex flex-wrap">
          <pre ref={previewAutomataRef} />
          <pre ref={previewSimplestAutomataRef} />
        </div>
      </div>
    </div>
  );
}
