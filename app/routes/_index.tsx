import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

import { type ToolRoot, routes } from "~/routes";

export const meta: MetaFunction = () => {
  return [
    { title: "tools" },
    { name: "description", content: "tksnn's tools" },
  ];
};

export default function Index() {
  const rootmap = routes.reduce(
    (m, r) => {
      if (r.hidden === true) return m;
      if (!m[r.cat]) m[r.cat] = [];
      m[r.cat].push(r);
      return m;
    },
    {} as Record<string, ToolRoot[]>
  );
  return (
    <div>
      <h1 className="text-2xl font-bold">Tools</h1>
      {Object.keys(rootmap).map((cat) => (
        <div key={cat} className="px-2 py-1">
          <div className="text-xl font-semibold text-indigo-950">/{cat}</div>
          <div className="flex flex-col">
            {rootmap[cat].map((r) => (
              <div
                key={`/${cat}/${r.slug}`}
                className="flex gap-x-1 px-4 items-baseline"
              >
                <Link
                  to={`/${cat}/${r.slug}`}
                  className="text-lg font-bold text-indigo-950 whitespace-nowrap"
                >
                  /{r.slug}
                </Link>
                <span className="text-gray-500 text-sm">:</span>
                <span className="text-gray-600 text-sm">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
