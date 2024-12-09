import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { type FocusEvent, useMemo } from "react";
import {
  type Transition,
  TransitionTable,
  useTransitionTable,
} from "~/components/automata";
import { getMeta } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("automata", "typst");
};

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const type_ = url.searchParams.get("type");
  const query = url.searchParams.get("q");
  return Response.json({ type_, query });
};

export default function Typst() {
  const { type_: automataType, query: defaultTableString } = useLoaderData<{
    type_: string | null;
    query: string | null;
  }>();
  const automataHook = useTransitionTable(
    automataType === "nfa",
    undefined,
    decodeURIComponent(defaultTableString || "")
  );
  const tableString = useMemo(() => {
    const values = automataHook.transitions.map((tran) => {
      const status = [];
      if (tran.initial) status.push("=q_0");
      if (tran.final) status.push("in F");
      const outputs2cell = (outputs: number[]) => {
        if (automataHook.isNFA) {
          if ((outputs || []).length === 0) {
            return "[$nothing$],";
          }
          return `[$\{${outputs.map((val) => automataHook.nodesById[val].node).join(",")}\}$],`;
        }
        if ((outputs || []).length === 0) {
          return "[],";
        }
        return `[$${automataHook.nodesById[outputs[0]].node}$],`;
      };
      return `    ${outputs2cell([tran.id])} [${status.length === 0 ? "" : `$${status.join(" ")}$`}], [${tran.id}], ${automataHook.outputKeys
        .map((key) => {
          return outputs2cell(tran.outputs[key] || []);
        })
        .join(" ")}`;
    });
    return `#figure(\n  table(\n    columns: (${Array(
      automataHook.outputKeys.length + 3
    )
      .fill("auto")
      .join(
        ","
      )}),\n    table.header([], [], [alias], ${automataHook.outputKeys.map((key) => `[${key}]`).join(", ")}),\n${values.join("\n")}\n  )\n)`;
  }, [
    automataHook.transitions,
    automataHook.outputKeys,
    automataHook.isNFA,
    automataHook.nodesById,
  ]);
  const automataString = useMemo(() => {
    let initialId = -1;
    const finalIds: number[] = [];
    for (const tran of automataHook.transitions) {
      if (tran.initial) initialId = tran.id;
      if (tran.final) finalIds.push(tran.id);
    }
    const cycleTranIds = [] as number[];
    const tran2tran = (tran: Transition) => {
      const outputs = {} as { [key: number]: string[] };
      for (const key of automataHook.outputKeys) {
        for (const id of tran.outputs[key] || []) {
          outputs[id] = outputs[id] || [];
          outputs[id].push(key);
        }
      }
      if ((outputs[tran.id] || []).length > 0) cycleTranIds.push(tran.id);
      const move = [] as string[];
      for (const key of Object.keys(outputs)) {
        if (outputs[Number(key)].length > 0) {
          if (outputs[Number(key)].length === 1) {
            move.push(`"${key}": "${outputs[Number(key)][0]}"`);
          } else {
            move.push(
              `"${key}": (${outputs[Number(key)].map((o) => `"${o}"`).join(", ")})`
            );
          }
        }
      }
      return `      "${tran.id}": (${move.join(", ")}),`;
    };
    return `#figure(\n  automaton(\n    (\n${automataHook.transitions.map(tran2tran).join("\n")}\n    ),\n    style: (\n      transition: (curve: 0.1),\n${cycleTranIds.map((id) => `      "${id}-${id}": (curve: 0),`).join("\n")}${cycleTranIds.length === 0 ? "" : "\n"}    ),\n    initial: "${initialId}",\n    final: (${finalIds.map((id) => `"${id}"`).join(", ")}),\n  ),\n)`;
  }, [automataHook.transitions, automataHook.outputKeys]);
  const onFocus = async (ev: FocusEvent<HTMLTextAreaElement>) => {
    ev.target.select();
    await navigator.clipboard.writeText(ev.target.value);
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">Typst Automata</h1>
      <div className="flex">
        <div className="flex items-center me-4">
          <input
            id="selectNFACheckbox"
            checked={automataHook.isNFA}
            onChange={(ev) => automataHook.setIsNFA(ev.target.checked)}
            type="radio"
            className="appearance-none h-4 w-4 border-4 border-gray-300 rounded-full checked:border-indigo-600 checked:bg-white"
          />
          <label
            htmlFor="selectNFACheckbox"
            className="ms-2 text-sm font-medium text-gray-900"
          >
            NFA
          </label>
        </div>
        <div className="flex items-center me-4">
          <input
            id="selectDFACheckbox"
            checked={!automataHook.isNFA}
            onChange={(ev) => automataHook.setIsNFA(!ev.target.checked)}
            type="radio"
            className="appearance-none h-4 w-4 border-4 border-gray-300 rounded-full checked:border-indigo-600 checked:bg-white"
          />
          <label
            htmlFor="selectDFACheckbox"
            className="ms-2 text-sm font-medium text-gray-900"
          >
            DFA
          </label>
        </div>
      </div>
      <TransitionTable hook={automataHook} />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col ">
          <span>Transition Table</span>
          <textarea
            className="w-full min-h-20 max-h-40 px-4 py-2"
            style={{ ["fieldSizing" as never]: "content" }}
            value={tableString}
            onFocus={onFocus}
            readOnly
          />
        </div>
        <div className="flex flex-col">
          <span>Automata</span>
          <textarea
            className="w-full min-h-20 max-h-40 px-4 py-2"
            style={{ ["fieldSizing" as never]: "content" }}
            value={automataString}
            onFocus={onFocus}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
