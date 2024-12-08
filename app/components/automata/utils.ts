import type { Transition } from "./types";

export const getMermaidFromTransitions = (
  trans: Transition[],
  outputKeys: string[],
  useId = false,
  useKatex = true
) => {
  let res = "graph LR;\nstyle start fill:none, stroke:none;\nstart(( ));\n";
  let initialId = -1;
  const nodes: { [key: string]: number } = {};
  for (const tran of trans) {
    if (tran.initial) initialId = tran.id;
    nodes[tran.node] = tran.id;
    res += tran.id.toString();
    res += tran.final ? "(((" : "((";
    res += useKatex ? '"$$' : '"';
    res += useId ? tran.id : tran.node;
    res += useKatex ? '$$"' : '"';
    res += tran.final ? ")))" : "))";
    res += ";\n";
  }
  res += `start --> ${initialId};\n`;
  for (const tran of trans) {
    const outputs = {} as { [key: number]: string[] };
    for (const key of outputKeys) {
      for (const id of tran.outputs[key] || []) {
        outputs[id] = outputs[id] || [];
        outputs[id].push(key);
      }
    }
    for (const key of Object.keys(outputs)) {
      res += `${tran.id} -->|${outputs[Number(key)].join(",")}| ${key};\n`;
    }
  }
  return res;
};

export const dfa2simplest = (
  transitions: Transition[],
  outputKeys: string[],
  nodesById: { [key: number]: Transition }
): { simplestTransitions: Transition[]; groupStrings: string[] } => {
  const simplestTransitions: Transition[] = [];
  const groupStrings: string[] = [];
  let equivalentGroups: number[][] = [[], []];
  for (const tran of transitions) {
    if (tran.final) equivalentGroups[1].push(tran.id);
    else equivalentGroups[0].push(tran.id);
  }
  groupStrings.push(JSON.stringify(equivalentGroups));
  while (true) {
    let newGroups: number[][] = [];
    for (const group of equivalentGroups) {
      const newGroup: { [key: string]: number[] } = {};
      for (const id of group) {
        const labels = [];
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
  return {
    simplestTransitions,
    groupStrings,
  };
};

export const nfa2dfa = (
  transitions: Transition[],
  outputKeys: string[],
  nodesById: { [key: number]: Transition }
): { dfaTransitions: Transition[]; outputKeys: string[] } => {
  let initialId = -1;
  const finalIds: number[] = [];
  const researchableKeys: { [key: number]: number[] } = {};
  const dfsKeys = (start: number, current: number, visited: Set<number>) => {
    visited.add(current);
    for (const neighbor of nodesById[current].outputs.ε || []) {
      if (!visited.has(neighbor)) {
        dfsKeys(start, neighbor, visited);
      }
    }
  };
  for (const tran of transitions) {
    if (tran.initial) initialId = tran.id;
    if (tran.final) finalIds.push(tran.id);
    const visited = new Set<number>();
    dfsKeys(tran.id, tran.id, visited);
    researchableKeys[tran.id] = Array.from(visited).toSorted((a, b) => a - b);
  }
  const outputs = transitions.reduce(
    (acc, tran) => {
      acc[tran.id] = outputKeys.reduce(
        (oacc, key) => {
          if (key === "ε") return oacc;
          const out = new Set<number>(
            researchableKeys[tran.id].flatMap((ekey) =>
              nodesById[ekey].outputs[key].flatMap((o) => researchableKeys[o])
            )
          );
          oacc[key] = Array.from(out).toSorted((a, b) => a - b);
          return oacc;
        },
        {} as { [key: string]: number[] }
      );
      return acc;
    },
    {} as { [id: number]: { [key: string]: number[] } }
  );
  let dfaNodeIdByNames: { [key: string]: number } = {};
  let nowKeysWaits: number[][] = [];
  const addWaits = (ids: number[]) => {
    const name =
      ids.length === 0
        ? "nothing"
        : `\{${ids.map((id) => nodesById[id].node).join(",")}\}`;
    if (Object.keys(dfaNodeIdByNames).includes(name)) return;
    dfaNodeIdByNames[name] = nowKeysWaits.length;
    nowKeysWaits.push(ids);
    for (const key of outputKeys) {
      if (key !== "ε") {
        const out = new Set<number>(ids.flatMap((id) => outputs[id][key]));
        addWaits(Array.from(out).toSorted((a, b) => a - b));
      }
    }
  };
  addWaits(researchableKeys[initialId]);
  if (Object.keys(dfaNodeIdByNames).includes("nothing")) {
    nowKeysWaits = [...nowKeysWaits.filter((wait) => wait.length !== 0), []];
    dfaNodeIdByNames = nowKeysWaits.reduce(
      (acc, wait, index) => {
        const name =
          wait.length === 0
            ? "nothing"
            : `\{${wait.map((id) => nodesById[id].node).join(",")}\}`;
        acc[name] = index;
        return acc;
      },
      {} as { [key: string]: number }
    );
  }
  const dfaTransitions = nowKeysWaits.map((nowKeys, index) => {
    const name =
      nowKeys.length === 0
        ? "nothing"
        : `\{${nowKeys.map((id) => nodesById[id].node).join(",")}\}`;
    return {
      id: dfaNodeIdByNames[name],
      node: name,
      initial: index === 0,
      final: nowKeys.some((id) => finalIds.includes(id)),
      outputs: outputKeys.reduce(
        (acc, key) => {
          if (key === "ε") return acc;
          const out = Array.from(
            new Set<number>(nowKeys.flatMap((id) => outputs[id][key]))
          ).toSorted((a, b) => a - b);
          const out_name =
            out.length === 0
              ? "nothing"
              : `\{${out.map((id) => nodesById[id].node).join(",")}\}`;
          acc[key] = [dfaNodeIdByNames[out_name]];
          return acc;
        },
        {} as { [key: string]: number[] }
      ),
    };
  });
  return {
    dfaTransitions,
    outputKeys: outputKeys.filter((key) => key !== "ε"),
  };
};
