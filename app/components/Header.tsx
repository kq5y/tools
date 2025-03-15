import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header className="bg-indigo-950 text-white px-4 py-4">
      <div className="container mx-auto">
        <h1 className="text-xl font-semibold">
          <Link to="/">tools.kq5.jp</Link>
        </h1>
      </div>
    </header>
  );
}
