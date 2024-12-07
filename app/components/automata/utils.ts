import type { Transition } from "./types";

export const getMermaidFromTransitions = (
  trans: Transition[],
  outputKeys: string[]
) => {
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
) => {
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
