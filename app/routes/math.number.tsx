import type { MetaFunction } from "@remix-run/cloudflare";
import { useMemo, useState } from "react";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("math", "number");
};

const NUMBER_BASES = [
  {
    id: "b",
    num: 2,
    name: "Binary",
    pattern: "[01]*",
  },
  {
    id: "q",
    num: 4,
    name: "Quaternary",
    pattern: "[0-3]*",
  },
  {
    id: "o",
    num: 8,
    name: "Octal",
    pattern: "[0-7]*",
  },
  {
    id: "d",
    num: 10,
    name: "Decimal",
    pattern: "[0-9]*",
  },
  {
    id: "h",
    num: 16,
    name: "Hexadecimal",
    pattern: "[0-9a-f]*",
  },
] as const;

type Numbers = {
  [key in (typeof NUMBER_BASES)[number]["id"]]: string;
};

export default function MathNumber() {
  const [numbers, setNumbers] = useState<Numbers>(
    NUMBER_BASES.reduce((acc, basem) => {
      acc[basem.id] = "";
      return acc;
    }, {} as Numbers)
  );
  const handleValueChange = (
    val: string,
    base: (typeof NUMBER_BASES)[number]
  ) => {
    if (val === "") {
      handleClear();
      return;
    }
    const dval = Number.parseInt(val, base.num);
    if (!Number.isNaN(dval)) {
      setNumbers({ ...numbers, [base.id]: val });
      setNumbers(
        NUMBER_BASES.reduce((acc, basem) => {
          acc[basem.id] = dval.toString(basem.num);
          return acc;
        }, {} as Numbers)
      );
    }
  };
  const handleClear = () => {
    setNumbers(
      NUMBER_BASES.reduce((acc, basem) => {
        acc[basem.id] = "";
        return acc;
      }, {} as Numbers)
    );
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">{getTitle("math", "number")}</h1>
      <div className="p-2">
        <div className="flex flex-col gap-1">
          {NUMBER_BASES.map((base) => (
            <div key={base.id} className="flex items-center space-x-2">
              <span className="w-24 text-right">{base.name}</span>
              <input
                type="text"
                className="flex-1 border rounded p-1"
                value={numbers[base.id]}
                pattern={base.pattern}
                onChange={(e) => handleValueChange(e.target.value, base)}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-x-2">
          <div className="w-24" />
          <div className="mr-auto p-1">{numbers.b.length}bit</div>
          <button
            type="button"
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
