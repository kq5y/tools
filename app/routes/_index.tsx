import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "tools" },
    { name: "description", content: "tksnn's tools" },
  ];
};

export default function Index() {
  return (
    <div>index page</div>
  );
}
