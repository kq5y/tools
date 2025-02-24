import type { MetaFunction } from "@remix-run/cloudflare";
import { type ChangeEvent, useMemo, useState } from "react";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("misc", "unicode");
};

export default function Unicode() {
  const [rawText, setRawText] = useState("");
  const unicodeText = useMemo(() => {
    return rawText.replace(/./g, (char) => {
      const code = char.charCodeAt(0).toString(16);
      return `\\u${code.padStart(4, "0")}`;
    });
  }, [rawText]);
  const encodedText = useMemo(() => {
    return encodeURIComponent(rawText);
  }, [rawText]);
  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(event.target.value);
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">{getTitle("misc", "unicode")}</h1>
      <div className="p-2">
        <div className="flex">
          <textarea
            value={rawText}
            onChange={handleTextChange}
            className="w-full h-32 p-2 border border-gray-300 rounded resize-none"
          />
        </div>
        <div className="mt-2">
          <label className="text-sm font-bold">
            Unicode Text
            <textarea
              value={unicodeText}
              readOnly
              className="w-full h-32 p-2 border border-gray-300 rounded resize-none font-normal"
            />
          </label>
        </div>
        <div>
          <label className="text-sm font-bold">
            HTML Encoded Text
            <textarea
              value={encodedText}
              readOnly
              className="w-full h-32 p-2 border border-gray-300 rounded resize-none font-normal"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
