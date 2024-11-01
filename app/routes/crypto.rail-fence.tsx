import type { MetaFunction } from "@remix-run/cloudflare";
import { useMemo, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "/crypto/rail-fence" },
    { name: "description", content: "Rail-Fence Cipher Encryption and Decryption" },
  ];
};

const railFenceEncrypt = (text: string, rails: number): string => {
  if (rails <= 1) return text;
  const rail: string[][] = Array.from({ length: rails }, () => []);
  let directionDown = false;
  let row = 0;
  for (const char of text) {
    rail[row].push(char);
    if (row === 0 || row === rails - 1) directionDown = !directionDown;
    row += directionDown ? 1 : -1;
  }
  return rail.flat().join('');
}

const railFenceDecrypt = (cipherText: string, rails: number): string => {
  if (rails <= 1) return cipherText;
  const rail = Array.from({ length: rails }, () => Array(cipherText.length).fill(null));
  let directionDown = false;
  let row = 0;
  for (let i = 0; i < cipherText.length; i++) {
    rail[row][i] = '*';
    if (row === 0 || row === rails - 1) directionDown = !directionDown;
    row += directionDown ? 1 : -1;
  }
  let index = 0;
  for (let r = 0; r < rails; r++) {
    for (let c = 0; c < cipherText.length; c++) {
      if (rail[r][c] === '*' && index < cipherText.length) {
        rail[r][c] = cipherText[index++];
      }
    }
  }
  let result = '';
  row = 0;
  directionDown = false;
  for (let i = 0; i < cipherText.length; i++) {
    result += rail[row][i];
    if (row === 0 || row === rails - 1) directionDown = !directionDown;
    row += directionDown ? 1 : -1;
  }
  return result;
}

export default function RailFence() {
  const [targetText, setTargetText] = useState("");
  const [usingRails, setUsingRails] = useState(3);
  const encryptedText = useMemo(() => {
    return railFenceEncrypt(targetText, usingRails);
  }, [targetText, usingRails]);
  const decryptedText = useMemo(() => {
    return railFenceDecrypt(targetText, usingRails);
  }, [targetText, usingRails]);
  return (
    <div>
      <h1 className="text-2xl font-bold">Rail-Fence Cipher</h1>
      <div className="p-2">
        <div className="mb-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none"
            value={targetText}
            placeholder="Target Text"
            onChange={e => setTargetText(e.target.value)}
            rows={4}
          />
        </div>
        <div className="mb-2">
          <input
            type="number"
            className="border bg-white border-gray-300 p-2 flex-grow rounded-l"
            placeholder="Rails Count"
            value={usingRails}
            min={1}
            onChange={e => setUsingRails(Number(e.target.value))}
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
  )
}
