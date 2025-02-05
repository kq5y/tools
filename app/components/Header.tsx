import { Link } from "@remix-run/react";

import { SITE_TITLE } from "~/const";

export default function Header() {
  return (
    <header className="bg-indigo-950 text-white px-4 py-4">
      <div className="container mx-auto">
        <h1 className="text-xl font-semibold">
          <Link to="/">{SITE_TITLE}</Link>
        </h1>
      </div>
    </header>
  );
}
