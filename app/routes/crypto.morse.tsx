import type { MetaFunction } from "@remix-run/cloudflare";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "/crypto/morse" },
    { name: "description", content: "Morse Code Encryption and Decryption" },
  ];
};

const morseCodeMap: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "0": "-----",
  " ": " ",
};

const reverseMorseCodeMap = Object.fromEntries(
  Object.entries(morseCodeMap).map(([key, value]) => [value, key])
);

export default function Morse() {
  const [targetText, setTargetText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [tonLetter, setTonLetter] = useState(".");
  const [tsuLetter, setTsuLetter] = useState("-");
  const [spaceLetter, setSpaceLetter] = useState(" ");
  const convertToMorse = (text: string): string => {
    if (tonLetter === "" || tsuLetter === "" || spaceLetter === "")
      return encryptedText;
    return text
      .toUpperCase()
      .split("")
      .map((char) => {
        return morseCodeMap[char] || char;
      })
      .join(spaceLetter)
      .trim()
      .replaceAll(".", tonLetter)
      .replaceAll("-", tsuLetter);
  };
  const convertToText = (morse: string): string => {
    if (tonLetter === "" || tsuLetter === "" || spaceLetter === "")
      return targetText;
    const morseWithStandardSymbols = morse
      .replaceAll(tonLetter, ".")
      .replaceAll(tsuLetter, "-");
    return morseWithStandardSymbols
      .split(spaceLetter)
      .map((code) => {
        return reverseMorseCodeMap[code] || code;
      })
      .join("")
      .trim();
  };
  const handleTargetTextChange = (text: string) => {
    setTargetText(text);
    setEncryptedText(convertToMorse(text));
  };
  const handleEncryptedTextChange = (text: string) => {
    setEncryptedText(text);
    setTargetText(convertToText(text));
  };
  const handleLetterChange = (ton: string, tsu: string, space: string) => {
    setTonLetter(ton);
    setTsuLetter(tsu);
    setSpaceLetter(space);
  };
  const handleLetterApply = (up: boolean) => {
    if (up) setTargetText(convertToText(encryptedText));
    else setEncryptedText(convertToMorse(targetText));
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">Morse Code</h1>
      <div className="p-2">
        <div className="mb-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none"
            value={targetText}
            placeholder="Target Text"
            onChange={(e) => handleTargetTextChange(e.target.value)}
            rows={4}
          />
        </div>
        <div className="mb-2 flex flex-row flex-wrap gap-4">
          <div className="flex flex-row gap-2 items-center">
            <span>Dot:</span>
            <input
              type="text"
              className="border bg-white border-gray-300 p-2 flex-grow rounded-l w-12"
              placeholder="."
              value={tonLetter}
              onChange={(e) =>
                handleLetterChange(e.target.value, tsuLetter, spaceLetter)
              }
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <span>Dash:</span>
            <input
              type="text"
              className="border bg-white border-gray-300 p-2 flex-grow rounded-l w-12"
              placeholder="-"
              value={tsuLetter}
              onChange={(e) =>
                handleLetterChange(tonLetter, e.target.value, spaceLetter)
              }
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <span>Space:</span>
            <input
              type="text"
              className="border bg-white border-gray-300 p-2 flex-grow rounded-l w-12"
              placeholder=" "
              value={spaceLetter}
              onChange={(e) =>
                handleLetterChange(tonLetter, tsuLetter, e.target.value)
              }
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <button
              className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              onClick={() => handleLetterApply(true)}
            >
              Apply↑
            </button>
            <button
              className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              onClick={() => handleLetterApply(false)}
            >
              Apply↓
            </button>
          </div>
        </div>
        <div className="mb-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none"
            value={encryptedText}
            onChange={(e) => handleEncryptedTextChange(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
