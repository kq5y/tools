import { useCallback } from "react";
import { Button } from "../Button";

interface ForwardTypstProps {
  type: "typst";
  isNFA: boolean;
  textEditorString: string;
}

interface ForwardSimplestProps {
  type: "simplest";
  textEditorString: string;
}

type ForwardButtonProps = ForwardTypstProps | ForwardSimplestProps;

export default function ForwardButton(props: ForwardButtonProps) {
  const onClick = useCallback(() => {
    const url = new URL(`/automata/${props.type}`, window.location.href);
    if (props.type === "typst") {
      url.searchParams.set("type", props.isNFA ? "nfa" : "dfa");
    }
    url.searchParams.set("q", encodeURIComponent(props.textEditorString));
    window.open(url.href, "_blank");
  }, [props]);
  return (
    <Button onClick={onClick}>
      {props.type === "typst" && "To Typst"}
      {props.type === "simplest" && "To Simplest"}
    </Button>
  );
}
