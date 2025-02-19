import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

import { type ToolRoot, routes } from "~/routes";

export const meta: MetaFunction = () => {
  return [{ title: "Tools" }, { name: "description", content: "kq5y's tools" }];
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
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Tools</h1>
      <div className="space-y-4">
        {Object.keys(rootmap).map((cat) => (
          <section key={cat} className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-semibold text-indigo-950 mb-2">
              /{cat}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rootmap[cat].map((r) => (
                <div
                  key={`/${cat}/${r.slug}`}
                  className="bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                >
                  <Link to={`/${cat}/${r.slug}`} className="block">
                    <div className="text-lg font-bold text-indigo-950">
                      /{r.slug}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">{r.desc}</div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
