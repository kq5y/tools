import elkLayouts from "@mermaid-js/layout-elk";
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
    { name: "description", content: "Convert the DFA to the simplest DFA" },
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
  const [editorMode, setEditorMode] = useState<"table" | "text">("table");
  const [textEditorString, setTextEditorString] = useState("");
  const previewAutomataRef = useRef<HTMLPreElement>(null);
  const previewSimplestAutomataRef = useRef<HTMLPreElement>(null);
  const [equivalentGroupConverts, setEquivalentGroupConverts] = useState<
    string[]
  >([]);
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
    let res = "graph LR;\nstyle start fill:none, stroke:none;\nstart(( ));\n";
    let initialId = -1;
    const nodes: { [key: string]: number } = {};
    for (const tran of trans) {
      if (tran.initial) initialId = tran.id;
      nodes[tran.node] = tran.id;
      if (tran.final) res += `${tran.id}(((${tran.node})));\n`;
      else res += `${tran.id}((${tran.node}));\n`;
    }
    res += `start --> ${initialId};\n`;
    for (const tran of trans) {
      const outputs = {} as { [key: string]: string[] };
      for (const key of outputKeys) {
        outputs[tran.outputs[key]] = outputs[tran.outputs[key]] || [];
        outputs[tran.outputs[key]].push(key);
      }
      for (const key of Object.keys(outputs)) {
        res += `${tran.id} -->|${outputs[key].join(",")}| ${nodes[key]};\n`;
      }
    }
    return res;
  };
  const getPreviewAutomataMermaid = useCallback(() => {
    return getMermaidFromTransitions(transitions);
  }, [transitions]);
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
                  nodesByName[nodesById[id].outputs[key]]
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
              nodesByName[
                nodesById[equivalentGroups[groupIdx][0]].outputs[key]
              ];
            for (
              let searchIdx = 0;
              searchIdx < equivalentGroups.length;
              searchIdx++
            ) {
              if (equivalentGroups[searchIdx].includes(target)) {
                acc[key] = equivalentGroups[searchIdx].join(",");
                break;
              }
            }
            return acc;
          },
          {} as { [key: string]: string }
        ),
      });
    }
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
  const applyTableEditor = useCallback(() => {
    let res = "|id|node|q0|F|" + outputKeys.join("|") + "|\n";
    res += "|---".repeat(4 + outputKeys.length) + "|\n";
    for (const tran of transitions) {
      res += `|${tran.id}|${tran.node}|${tran.initial}|${tran.final}|`;
      res += outputKeys.map((key) => tran.outputs[key]).join("|") + "|\n";
    }
    setTextEditorString(res);
  }, [transitions]);
  const textEditorApplicable = useMemo(() => {
    const rows = textEditorString.trim().split("\n");
    if (rows.length <= 2) return false;
    const headerColumns = rows[0]
      .split("|")
      .map((col) => col.trim())
      .filter((col) => col);
    if (headerColumns.length !== 4 + outputKeys.length) return false;
    const ids = new Set<number>();
    for (let i = 2; i < rows.length; i++) {
      const columns = rows[i]
        .split("|")
        .map((col) => col.trim())
        .filter((col) => col);
      if (columns.length !== 4 + outputKeys.length) return false;
      if (isNaN(Number(columns[0]))) return false;
      if (
        ![columns[2], columns[3]].every(
          (value) => value === "true" || value === "false"
        )
      )
        return false;
      if (ids.has(Number(columns[0]))) return false;
      ids.add(Number(columns[0]));
    }
    return true;
  }, [textEditorString]);
  const applyTextEditor = useCallback(() => {
    const newTransitions: Transition[] = [];
    const rows = textEditorString.trim().split("\n");
    for (let i = 2; i < rows.length; i++) {
      const columns = rows[i]
        .split("|")
        .map((col) => col.trim())
        .filter((col) => col);
      newTransitions.push({
        id: Number(columns[0]),
        node: columns[1],
        initial: columns[2].toLowerCase() === "true",
        final: columns[3].toLowerCase() === "true",
        outputs: outputKeys.reduce(
          (acc, key, idx) => {
            acc[key] = columns[4 + idx];
            return acc;
          },
          {} as { [key: string]: string }
        ),
      });
    }
    setTransitions(newTransitions);
    setEditorMode("table");
  }, [textEditorString]);
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
      <div className="mb-2 border-b border-gray-200">
        <ul className="flex flex-wrap text-center">
          <li className="me-2">
            <button
              className={
                "inline-block p-2 border-b-2 rounded-t-lg" +
                (editorMode === "table"
                  ? "text-indigo-600 hover:text-indigo-600 border-indigo-600"
                  : "text-gray-500 hover:text-gray-600 border-gray-100 hover:border-gray-300")
              }
              onClick={() => setEditorMode("table")}
            >
              Table
            </button>
          </li>
          <li className="me-2">
            <button
              className={
                "inline-block p-2 border-b-2 rounded-t-lg" +
                (editorMode === "text"
                  ? "text-indigo-600 hover:text-indigo-600 border-indigo-600"
                  : "hover:text-gray-600 hover:border-gray-300")
              }
              onClick={() => {
                applyTableEditor();
                setEditorMode("text");
              }}
            >
              Text
            </button>
          </li>
        </ul>
      </div>
      <div>
        <div className="p-2" hidden={editorMode !== "table"}>
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
        </div>
        <div className="p-2" hidden={editorMode !== "text"}>
          <textarea
            className="w-full min-h-40 max-h-80 px-4 py-2"
            style={{ ["fieldSizing" as never]: "content" }}
            value={textEditorString}
            onChange={(ev) => setTextEditorString(ev.target.value)}
          />
          <div>
            <button
              className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              onClick={applyTextEditor}
              disabled={!textEditorApplicable}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
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
          <span>
            P{idx} = {conv}
          </span>
        ))}
      </div>
    </div>
  );
}
