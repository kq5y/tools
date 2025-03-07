import type { MetaFunction } from "@remix-run/cloudflare";
import { useMemo, useState } from "react";

import { Checkbox } from "~/components/Checkbox";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("crypto", "substitution");
};

export default function Substitution() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const [encrypted, setEncrypted] = useState("");
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [enableTextWrap, setEnableTextWrap] = useState(true);
  const handleMappingChange = (letter: string, value: string) => {
    setMapping((prev) => ({ ...prev, [letter]: value }));
  };
  const letterCount = useMemo(() => {
    const count: { [key: string]: number } = {};
    for (const letter of alphabet) {
      count[letter] = Object.values(mapping).filter((v) => v === letter).length;
    }
    return count;
  }, [mapping]);
  const decrypted = useMemo(() => {
    return encrypted.split("").map((char) => {
      const lowerChar = char.toLowerCase();
      const mappedChar = mapping[lowerChar] || char;
      const isUpperCase = char === char.toUpperCase();
      return {
        original: char,
        replaced: isUpperCase ? mappedChar.toUpperCase() : mappedChar,
        isReplaced: Boolean(
          mapping[lowerChar] ||
            alphabet.filter((l) => l === lowerChar).length <= 0
        ),
      };
    });
  }, [encrypted, mapping]);
  const letterFrequency = useMemo(() => {
    const frequency: { [key: string]: number } = {};
    for (const char of encrypted.toLowerCase().split("")) {
      if (alphabet.includes(char)) {
        frequency[char] = (frequency[char] || 0) + 1;
      }
    }
    return alphabet
      .map((letter) => ({
        letter,
        count: frequency[letter] || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [encrypted]);
  return (
    <div>
      <h1 className="text-2xl font-bold">
        {getTitle("crypto", "substitution")}
      </h1>
      <div className="p-2">
        <div className="mb-2">
          <textarea
            className={`w-full p-2 border border-gray-300 rounded resize-none overflow-auto ${enableTextWrap ? "break-all" : "whitespace-nowrap"}`}
            value={encrypted}
            onChange={(e) => setEncrypted(e.target.value)}
            rows={4}
          />
        </div>
        <div className="mb-2 flex flex-wrap gap-2">
          {alphabet.map((letter) => (
            <div key={letter} className="flex flex-col items-center">
              <span
                style={{
                  fontWeight: letterCount[letter] === 1 ? "bold" : "normal",
                  color: letterCount[letter] >= 2 ? "red" : "black",
                }}
              >
                {letter.toUpperCase()}
              </span>
              <input
                type="text"
                maxLength={1}
                value={mapping[letter] || ""}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleMappingChange(letter, e.target.value)}
                className="w-8 p-1 border text-center"
                aria-label={`Substitution for ${letter.toUpperCase()}`}
              />
            </div>
          ))}
        </div>
        <div className="mb-2 p-2 border h-28 bg-white overflow-auto">
          <code
            className={enableTextWrap ? "break-all" : ""}
            style={{ fontFamily: "inherit" }}
          >
            {decrypted.map((charObj, index) =>
              charObj.replaced === "\n" ? (
                <br key={index.toString()} />
              ) : (
                <span
                  key={index.toString()}
                  style={{ color: charObj.isReplaced ? "black" : "red" }}
                >
                  {charObj.replaced === " " ? "\u00A0" : charObj.replaced}
                </span>
              )
            )}
          </code>
        </div>
        <div className="mb-2">
          <Checkbox
            checked={enableTextWrap}
            onChange={(e) => setEnableTextWrap(e.target.checked)}
          >
            text wrap
          </Checkbox>
        </div>
        <div className="mb-2">
          <div className="flex flex-wrap gap-x-4">
            {letterFrequency.map(({ letter, count }) => (
              <div key={letter} className="flex items-center">
                <span className="font-bold">{letter.toUpperCase()}:</span>
                <span className="ml-1">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
