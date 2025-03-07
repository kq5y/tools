import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button, CrossButton, TabButton } from "../Button";
import { Checkbox } from "../Checkbox";
import type {
  FocusConfig,
  Transition,
  TransitionTableHookReturn,
} from "./types";

interface Props {
  hook: TransitionTableHookReturn;
  readOnly?: boolean;
  children?: ReactNode;
}

export default function TransitionTable({
  hook: {
    transitions,
    setTransitions,
    nodesById,
    outputKeys,
    setOutputKeys,
    isNFA,
    editorMode,
    setEditorMode,
    textEditorString,
    setTextEditorString,
  },
  readOnly = false,
  children = undefined,
}: Props) {
  const focusAreaRef = useRef<HTMLDivElement | null>(null);
  const [focusConfig, setFocusConfig] = useState<FocusConfig>({
    open: false,
    index: 0,
    key: "",
    top: 0,
    left: 0,
  });
  const lastTransitionId = useMemo(() => {
    return transitions[transitions.length - 1].id;
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
  const onOutputFocusChange = (
    val: boolean,
    index = 0,
    key = "",
    el: HTMLInputElement | null = null
  ) => {
    if (readOnly) return;
    if (el) {
      const rect = el.getBoundingClientRect();
      setFocusConfig({
        open: val,
        index,
        key,
        top: rect.top + rect.height,
        left: rect.left,
      });
    } else {
      setFocusConfig({
        ...focusConfig,
        open: val,
        index,
        key,
      });
    }
  };
  const onOutputChange = (id: number) => {
    setTransitions(
      transitions.map((tran, idx) => {
        if (focusConfig.index === idx) {
          if (isNFA) {
            if ((tran.outputs[focusConfig.key] || []).includes(id)) {
              tran.outputs[focusConfig.key] = (
                tran.outputs[focusConfig.key] || []
              ).reduce((acc, nid) => {
                if (nid !== id) acc.push(nid);
                return acc;
              }, [] as number[]);
            } else {
              tran.outputs[focusConfig.key] = transitions.reduce(
                (acc, ntran) => {
                  if (
                    (tran.outputs[focusConfig.key] || []).includes(ntran.id) ||
                    ntran.id === id
                  )
                    acc.push(ntran.id);
                  return acc;
                },
                [] as number[]
              );
            }
          } else {
            if (tran.outputs[focusConfig.key].includes(id)) {
              tran.outputs[focusConfig.key] = [];
            } else {
              tran.outputs[focusConfig.key] = [id];
            }
          }
        }
        return tran;
      })
    );
  };
  const addTransition = () => {
    setTransitions([
      ...transitions,
      {
        id: lastTransitionId + 1,
        node: `q_${lastTransitionId + 1}`,
        initial: false,
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
  };
  const addOutput = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    const remaining = alphabet.filter((letter) => !outputKeys.includes(letter));
    if (remaining.length > 0) {
      setOutputKeys([...outputKeys, remaining[0]]);
    }
  };
  const deleteOutput = (delkey: string) => {
    setOutputKeys(outputKeys.filter((key) => key !== delkey));
  };
  const deleteTransition = (id: number) => {
    setTransitions(
      transitions.reduce((acc, tran) => {
        tran.outputs = outputKeys.reduce(
          (acc, key) => {
            acc[key] = (tran.outputs[key] || []).filter((nid) => id !== nid);
            return acc;
          },
          {} as { [key: string]: number[] }
        );
        if (tran.id !== id) acc.push(tran);
        return acc;
      }, [] as Transition[])
    );
  };
  const textEditorApplicable = useMemo(() => {
    const rows = textEditorString.trim().split("\n");
    if (rows.length <= 2) return false;
    const headerColumns = rows[0]
      .split("|")
      .map((col) => col.trim())
      .filter((col) => col);
    if (headerColumns.length < 6 + (isNFA ? 1 : 0)) return false;
    const outputKeyLength = headerColumns.length - 4;
    if (
      isNFA &&
      rows[0]
        .split("|")
        .map((col) => col.trim())
        .slice(1, -1)[4] !== "ε"
    )
      return false;
    const ids = new Set<number>();
    for (let i = 2; i < rows.length; i++) {
      const columns = rows[i]
        .split("|")
        .map((col) => col.trim())
        .slice(1, -1);
      if (columns.length !== 4 + outputKeyLength) return false;
      if (Number.isNaN(Number(columns[0]))) return false;
      if (
        ![columns[2], columns[3]].every(
          (value) => value === "true" || value === "false"
        )
      )
        return false;
      for (let j = 4; j < columns.length; j++) {
        if (
          columns[j]
            .split(",")
            .filter((col) => col)
            .some((val) => Number.isNaN(Number(val)))
        )
          return false;
      }
      if (ids.has(Number(columns[0]))) return false;
      ids.add(Number(columns[0]));
    }
    for (let i = 2; i < rows.length; i++) {
      const columns = rows[i]
        .split("|")
        .map((col) => col.trim())
        .slice(1, -1);
      for (let j = 4; j < columns.length; j++) {
        if (
          columns[j]
            .split(",")
            .filter((col) => col)
            .some((val) => !ids.has(Number(val)))
        )
          return false;
      }
    }
    return true;
  }, [textEditorString, isNFA]);
  const applyTextEditor = useCallback(() => {
    const rows = textEditorString.trim().split("\n");
    const newTransitions: Transition[] = [];
    const newOutputKeys = rows[0]
      .split("|")
      .map((col) => col.trim())
      .slice(1, -1)
      .slice(4);
    for (let i = 2; i < rows.length; i++) {
      const columns = rows[i]
        .split("|")
        .map((col) => col.trim())
        .slice(1, -1);
      newTransitions.push({
        id: Number(columns[0]),
        node: columns[1],
        initial: columns[2].toLowerCase() === "true",
        final: columns[3].toLowerCase() === "true",
        outputs: newOutputKeys.reduce(
          (acc, key, idx) => {
            acc[key] = columns[4 + idx]
              .split(",")
              .filter((val) => val)
              .map((nid) => Number(nid))
              .toSorted((a, b) => a - b);
            return acc;
          },
          {} as { [key: string]: number[] }
        ),
      });
    }
    setTransitions(newTransitions);
    setOutputKeys(newOutputKeys);
    setEditorMode("table");
  }, [textEditorString]);
  const getNodes = useCallback(
    (outputs: number[]) => {
      return outputs.map((val) => nodesById[val].node);
    },
    [nodesById]
  );
  const handleClickFocusOutside = (ev: MouseEvent) => {
    if (
      focusAreaRef.current &&
      !focusAreaRef.current.contains(ev.target as HTMLElement)
    ) {
      onOutputFocusChange(false);
    }
  };
  useEffect(() => {
    let res = `|id|node|q0|F|${outputKeys.join("|")}|\n`;
    res += `${"|---".repeat(4 + outputKeys.length)}|\n`;
    for (const tran of transitions) {
      res += `|${tran.id}|${tran.node}|${tran.initial}|${tran.final}|`;
      res += `${outputKeys.map((key) => (tran.outputs[key] || []).join(",")).join("|")}|\n`;
    }
    setTextEditorString(res);
  }, [transitions, outputKeys]);
  useEffect(() => {
    if (focusConfig.open) {
      document.addEventListener("mousedown", handleClickFocusOutside);
    } else {
      document.removeEventListener("mousedown", handleClickFocusOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickFocusOutside);
    };
  }, [focusConfig]);
  useEffect(() => {
    if (textEditorString !== "" && textEditorApplicable) {
      applyTextEditor();
    }
  }, []);
  return (
    <div>
      <div className="mb-2 border-b border-gray-200">
        <ul className="flex flex-wrap text-center">
          <li className="me-2">
            <TabButton
              selected={editorMode === "table"}
              onClick={() => setEditorMode("table")}
            >
              Table
            </TabButton>
          </li>
          <li className="me-2">
            <TabButton
              selected={editorMode === "text"}
              onClick={() => setEditorMode("text")}
            >
              Text
            </TabButton>
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
                  />
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
                  {outputKeys.map((key, idx) => (
                    <th
                      className="border border-gray-300 px-4 py-2 relative"
                      key={key}
                    >
                      {key}
                      {idx >= (isNFA ? 3 : 2) && (
                        <CrossButton
                          className="absolute right-3 inset-y-0"
                          onClick={() => deleteOutput(key)}
                          disabled={readOnly}
                        />
                      )}
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
                        disabled={readOnly}
                      />
                    </td>
                    <td className="border border-gray-300 text-center">
                      <Checkbox
                        checked={tran.initial}
                        onChange={(ev) => onTranInitialChange(ev, index)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="border border-gray-300 text-center">
                      <Checkbox
                        checked={tran.final}
                        onChange={(ev) => onTranFinalChange(ev, index)}
                        disabled={readOnly}
                      />
                    </td>
                    {outputKeys.map((key) => (
                      <td className="border border-gray-300" key={key}>
                        <input
                          className="px-4 py-2 w-32"
                          type="text"
                          value={getNodes(tran.outputs[key] || []).join(",")}
                          readOnly
                          disabled={readOnly}
                          onFocus={(ev) =>
                            onOutputFocusChange(true, index, key, ev.target)
                          }
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 text-center">
                      {tran.id !== 0 && (
                        <CrossButton
                          onClick={() => deleteTransition(tran.id)}
                          disabled={readOnly}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {focusConfig.open && (
            <div>
              <div className="fixed top-0 left-0 w-full h-full z-10">
                <div
                  className="absolute px-4 py-2 bg-white border border-gray-300 rounded shadow-md z-20 min-w-32"
                  style={{ top: focusConfig.top, left: focusConfig.left }}
                  ref={focusAreaRef}
                >
                  <ul>
                    {transitions.map((otran) => (
                      <li className="flex gap-2" key={otran.id}>
                        <Checkbox
                          checked={(
                            transitions[focusConfig.index].outputs[
                              focusConfig.key
                            ] || []
                          ).includes(otran.id)}
                          onChange={() => onOutputChange(otran.id)}
                        >
                          {otran.id}: {otran.node}
                        </Checkbox>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {!readOnly && (
              <>
                <Button onClick={addTransition}>Add Transition</Button>
                <Button onClick={addOutput}>Add Output</Button>
              </>
            )}
            {children}
          </div>
        </div>
        <div className="p-2" hidden={editorMode !== "text"}>
          <textarea
            className="w-full min-h-40 max-h-80 px-4 py-2"
            style={{ ["fieldSizing" as never]: "content" }}
            value={textEditorString}
            onChange={(ev) => setTextEditorString(ev.target.value)}
            disabled={readOnly}
          />
          {!readOnly && (
            <div>
              <Button
                onClick={applyTextEditor}
                disabled={!textEditorApplicable}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
