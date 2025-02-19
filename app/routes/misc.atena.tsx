import type { MetaFunction } from "@remix-run/cloudflare";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import { Button } from "~/components/Button";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("misc", "atena");
};

interface Address {
  code: string;
  address: string[];
  company: string;
  name: string;
  title: string;
}

export default function Atena() {
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });
  const [recipientAddress, setRecipientAddress] = useState<Address>({
    code: "",
    address: ["", "", ""],
    company: "",
    name: "",
    title: "",
  });
  const [count, setCount] = useState(1);
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipientAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleRecipientAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    setRecipientAddress((prev) => ({
      ...prev,
      address: prev.address.map((address, i) =>
        i === index ? value : address
      ),
    }));
  };
  const handleClear = () => {
    setRecipientAddress({
      code: "",
      address: ["", "", ""],
      company: "",
      name: "",
      title: "",
    });
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">{getTitle("misc", "atena")}</h1>
      <div className="p-2">
        <div className="grid grid-cols-6 gap-x-4 gap-y-1">
          <label className="col-span-2">
            <span className="block font-medium">Code</span>
            <input
              type="text"
              name="code"
              value={recipientAddress.code}
              onChange={handleRecipientChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={8}
            />
          </label>
          {recipientAddress.address.map((address, i) => (
            <label key={`address-${i.toString()}`} className="col-span-6">
              <span className="block font-medium">Address {i + 1}</span>
              <input
                type="text"
                value={address}
                onChange={(e) => handleRecipientAddressChange(e, i)}
                className="w-full p-1 border border-gray-300 rounded"
                maxLength={21}
              />
            </label>
          ))}
          <label className="col-span-6">
            <span className="block font-medium">Company</span>
            <input
              type="text"
              name="company"
              value={recipientAddress.company}
              onChange={handleRecipientChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={21}
            />
          </label>
          <label className="col-span-5">
            <span className="block font-medium">Name</span>
            <input
              type="text"
              name="name"
              value={recipientAddress.name}
              onChange={handleRecipientChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={19}
            />
          </label>
          <label className="col-span-1">
            <span className="block font-medium">Title</span>
            <input
              type="text"
              name="title"
              value={recipientAddress.title}
              onChange={handleRecipientChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={2}
            />
          </label>
        </div>
        <div className="mt-2 flex items-center gap-x-2">
          <Button onClick={() => handlePrint()}>Print</Button>
          <input
            className="w-24 mr-auto px-3 py-2 border border-gray-300 rounded"
            type="number"
            value={count}
            onChange={(e) => setCount(Number.parseInt(e.target.value))}
            min={1}
          />
          <Button onClick={handleClear}>Clear</Button>
        </div>
      </div>
      <div className="hidden">
        <div
          ref={printRef}
          className="bg-white p-4 flex flex-wrap"
          style={{ fontFamily: "ui-serif, serif" }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div
              className="border p-4 w-[100mm] h-[50mm]"
              key={`card-${i.toString()}`}
            >
              <p className="text-base font-bold mb-2">
                <span className="text-sm mr-1">〒</span>
                {recipientAddress.code}
              </p>
              {recipientAddress.address.map((line, i) => (
                <p key={`address-${i.toString()}`}>
                  {line.length > 0 ? line : "　"}
                </p>
              ))}
              {recipientAddress.company.length > 0 && (
                <p className="mt-2">{recipientAddress.company}</p>
              )}
              <p className={recipientAddress.company.length > 0 ? "" : "mt-2"}>
                {recipientAddress.name}　{recipientAddress.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
