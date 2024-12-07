import type { MetaFunction } from "@remix-run/cloudflare";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "/crypto/caesar" },
    { name: "description", content: "Caesar Cipher Encryption and Decryption" },
  ];
};

const caesarShift = (text: string, shift: number) => {
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(
          ((char.charCodeAt(0) - 97 + shift) % 26) + 97
        );
      }
      if (/[A-Z]/.test(char)) {
        return String.fromCharCode(
          ((char.charCodeAt(0) - 65 + shift) % 26) + 65
        );
      }
      return char;
    })
    .join("");
};

export default function Caesar() {
  const [targetText, setTargetText] = useState("");
  const [results, setResults] = useState<
    { shift: number; shiftedText: string }[]
  >([]);
  const handleEncrypt = () => {
    const shiftedResults = Array.from({ length: 26 }, (_, i) => ({
      shift: i + 1,
      shiftedText: caesarShift(targetText, i + 1),
    }));
    setResults(shiftedResults);
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">Caesar Cipher</h1>
      <div className="p-2">
        <div className="mb-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded resize-none"
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            rows={4}
          />
        </div>
        <div className="mb-2">
          <button
            type="button"
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            onClick={handleEncrypt}
          >
            Encrypt
          </button>
        </div>
        {results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Shift</th>
                  <th className="border border-gray-300 p-2">Shifted Text</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.shift}>
                    <td className="border border-gray-300 p-2 text-center">
                      {result.shift}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded resize-none"
                        value={result.shiftedText}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
