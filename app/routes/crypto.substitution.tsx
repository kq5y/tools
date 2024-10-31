import type { MetaFunction } from "@remix-run/cloudflare";
import { useMemo, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "/crypto/substitution" },
    { name: "description", content: "Helping to decipher substitutions" },
  ];
};

export default function Substitution() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const [encrypted, setEncrypted] = useState("");
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const handleMappingChange = (letter: string, value: string) => {
    setMapping((prev) => ({ ...prev, [letter]: value }));
  };
  const letterCount = useMemo(() => {
    const count: { [key: string]: number } = {};
    alphabet.forEach((letter) => {
      count[letter] = Object.values(mapping).filter((v) => v === letter).length;
    });
    return count;
  }, [mapping]);
  const decrypted = useMemo(() => {
    return encrypted.split("").map((char) => ({
      original: char,
      replaced: mapping[char] || char,
      isReplaced: Boolean(mapping[char]),
    }));
  }, [encrypted, mapping]);
  return (
    <div>
      <h1 className="text-2xl font-bold">Substitution Support</h1>
      <div className="p-2">
        <div className="mb-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none overflow-auto whitespace-nowrap"
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
                onChange={(e) => handleMappingChange(letter, e.target.value)}
                className="w-8 p-1 border text-center"
              />
            </div>
          ))}
        </div>
        <div className="mb-2 p-2 border h-28 overflow-auto bg-white">
          {decrypted.map((charObj, index) =>
            charObj.replaced === "\n" ? (
              <br key={index} />
            ) : (
              <span
                key={index}
                style={{ color: charObj.isReplaced ? "black" : "red" }}
              >
                {charObj.replaced === " " ? "\u00A0" : charObj.replaced}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
}
