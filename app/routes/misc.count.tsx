import type { MetaFunction } from "@remix-run/cloudflare";
import { type ChangeEvent, useMemo, useState } from "react";

import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("misc", "count");
};

const COUNT_TYPES = {
  raw: "Character",
  exc_breaks: "Exclude Breaks",
  exc_spaces: "Exclude Spaces",
  byte_utf8: "Byte (UTF-8)",
  lines: "Lines",
  words: "Words",
};

export default function Count() {
  const [rawText, setRawText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [realtime, setRealtime] = useState(true);
  const counts = useMemo<{ [key in keyof typeof COUNT_TYPES]: number }>(() => {
    return {
      raw: targetText.length,
      exc_breaks: targetText.replace(/\n/g, "").length,
      exc_spaces: targetText.replace(/\s/g, "").length,
      byte_utf8: new TextEncoder().encode(targetText).length,
      lines: targetText.length ? targetText.split("\n").length : 0,
      words: targetText.length ? targetText.split(/\s+/).length : 0,
    };
  }, [targetText]);
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
    if (realtime) setTargetText(e.target.value);
  };
  const handleCount = () => {
    if (realtime) return;
    setTargetText(rawText);
  };
  const handleClear = () => {
    setRawText("");
    setTargetText("");
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">{getTitle("misc", "count")}</h1>
      <div className="p-2">
        <div className="flex">
          <textarea
            value={rawText}
            onChange={handleTextChange}
            className="w-full h-32 p-2"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <Button onClick={handleCount}>Count</Button>
          <Button onClick={handleClear}>Clear</Button>
          <Checkbox
            className="ml-2"
            checked={realtime}
            onChange={(e) => setRealtime(e.target.checked)}
          >
            Realtime
          </Checkbox>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          {Object.entries(counts).map(([key, value]) => (
            <div key={key}>
              <span className="font-bold">
                {COUNT_TYPES[key as keyof typeof COUNT_TYPES]}:
              </span>
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
