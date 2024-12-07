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
