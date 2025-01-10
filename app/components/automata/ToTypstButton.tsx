import { useCallback } from "react";
import { Button } from "../Button";

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
  }, [textEditorString, isNFA]);
  return <Button onClick={onClick}>To Typst</Button>;
}
