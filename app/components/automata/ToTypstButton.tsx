import { useCallback } from "react";

interface Props {
  isNFA: boolean;
  textEditorString: string;
}

export default function ToTypstButton({ isNFA, textEditorString }: Props) {
  const onClick = useCallback(() => {
    const url = new URL("/automata/typst", window.location.href);
    url.searchParams.set("type", isNFA ? "nfa" : "dfa");
    url.searchParams.set("q", encodeURIComponent(textEditorString));
    window.open(url.href, "_blank");
  }, [isNFA, textEditorString]);
  return (
    <button
      type="button"
      className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed"
      onClick={onClick}
    >
      To Typst
    </button>
  );
}
