import type { MetaFunction } from "@remix-run/cloudflare";
import { useMemo, useState } from "react";
import { getMeta } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("crypto", "vigenere");
};

const vigenereEncrypt = (text: string, key: string): string => {
  const keyLength = key.length;
  let keyIndex = 0;
  return text
    .split("")
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        const offset = char.charCodeAt(0) < 97 ? 65 : 97;
        const keyChar = key[keyIndex % keyLength].toLowerCase();
        keyIndex++;
        return String.fromCharCode(
          ((char.charCodeAt(0) - offset + (keyChar.charCodeAt(0) - 97)) % 26) +
            offset
        );
      }
      return char;
    })
    .join("");
};

const vigenereDecrypt = (text: string, key: string): string => {
  const keyLength = key.length;
  let keyIndex = 0;
  return text
    .split("")
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        const offset = char.charCodeAt(0) < 97 ? 65 : 97;
        const keyChar = key[keyIndex % keyLength].toLowerCase();
        keyIndex++;
        return String.fromCharCode(
          ((char.charCodeAt(0) - offset - (keyChar.charCodeAt(0) - 97) + 26) %
            26) +
            offset
        );
      }
      return char;
    })
    .join("");
};

export default function Vigenere() {
  const [targetText, setTargetText] = useState("");
  const [usingKey, setUsingKey] = useState("");
  const encryptedText = useMemo(() => {
    if (usingKey.length <= 0) return "";
    return vigenereEncrypt(targetText, usingKey);
  }, [targetText, usingKey]);
  const decryptedText = useMemo(() => {
    if (usingKey.length <= 0) return "";
    return vigenereDecrypt(targetText, usingKey);
  }, [targetText, usingKey]);
  return (
    <div>
      <h1 className="text-2xl font-bold">Vigenere Cipher</h1>
      <div className="p-2">
        <div className="mb-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none"
            value={targetText}
            placeholder="Target Text"
            onChange={(e) => setTargetText(e.target.value)}
            rows={4}
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="border bg-white border-gray-300 p-2 flex-grow rounded-l"
            placeholder="Key"
            value={usingKey}
            onChange={(e) => setUsingKey(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <span>Encrypted Text</span>
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none"
            value={encryptedText}
            readOnly
            rows={4}
          />
        </div>
        <div className="mb-2">
          <span>Decrypted Text</span>
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none"
            value={decryptedText}
            readOnly
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
