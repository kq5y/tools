import type { MetaFunction } from "@remix-run/cloudflare";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import { Button, CharButton, CrossButton } from "~/components/Button";
import { getMeta, getTitle } from "~/routes";

export const meta: MetaFunction = () => {
  return getMeta("misc", "atena");
};

interface ZipCodeAPIResponse {
  code: number;
  data: {
    pref: string;
    address: string;
    city: string;
    town: string;
    fullAddress: string;
  };
}

interface Address {
  code: string;
  address: string[];
  company: string;
  name: string;
  title: string;
  enclosure: string;
}

const isSaveData = (data: unknown): data is Address[] =>
  Array.isArray(data) &&
  data.every(
    (addr) =>
      typeof addr.code === "string" &&
      Array.isArray(addr.address) &&
      addr.address.every((line: unknown) => typeof line === "string") &&
      typeof addr.company === "string" &&
      typeof addr.name === "string" &&
      typeof addr.title === "string" &&
      typeof addr.enclosure === "string"
  );

export default function Atena() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });
  const [editingAddress, setEditingAddress] = useState<Address>({
    code: "",
    address: ["", "", ""],
    company: "",
    name: "",
    title: "",
    enclosure: "",
  });
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [count, setCount] = useState(1);
  const handleSearchCode = async () => {
    const code = editingAddress.code.replace(/[^0-9]/g, "");
    if (code.length !== 7) return;
    const response = await fetch(`https://api.zipaddress.net/?zipcode=${code}`);
    if (!response.ok) return;
    const data = (await response.json()) as ZipCodeAPIResponse;
    if (data.code === 200) {
      setEditingAddress((prev) => ({
        ...prev,
        address: prev.address.map((addr, i) =>
          i === 0 ? data.data.fullAddress : addr
        ),
      }));
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    setEditingAddress((prev) => ({
      ...prev,
      address: prev.address.map((addr, i) => (i === index ? value : addr)),
    }));
  };
  const handleClear = () => {
    setEditingAddress({
      code: "",
      address: ["", "", ""],
      company: "",
      name: "",
      title: "",
      enclosure: "",
    });
  };
  const handleAdd = () => {
    const newAddress: Address = { ...editingAddress };
    setAddressList((prev) => [
      ...prev,
      ...Array.from({ length: count }).map(() => newAddress),
    ]);
    handleClear();
  };
  const handleApply = (index: number) => {
    const addr = addressList[index];
    setEditingAddress({ ...addr });
  };
  const handleRemove = (index: number) => {
    setAddressList((prev) => prev.filter((_, i) => i !== index));
  };
  const insertHyphen = (code: string) => {
    return code.replace(/(\d{3})(\d{4})/, "$1-$2");
  };
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(addressList)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atena${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleUpload = () => {
    if (!confirm("The data will be overwritten.")) return;
    const reader = new FileReader();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target?.files?.[0]) {
        reader.readAsText(target.files[0]);
      }
    };
    reader.onload = (e) => {
      if (typeof e.target?.result !== "string") return;
      const uploadData = JSON.parse(e.target.result);
      if (isSaveData(uploadData)) setAddressList(uploadData);
    };
    input.click();
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">{getTitle("misc", "atena")}</h1>
      <div className="p-2 border mb-4 mt-2">
        <div className="grid grid-cols-6 gap-x-4 gap-y-1">
          <label className="col-span-2">
            <span className="block font-medium">Code</span>
            <input
              type="text"
              name="code"
              value={editingAddress.code}
              onChange={handleChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={8}
              aria-label="Zip Code"
              placeholder="100-0001"
            />
          </label>
          <div className="col-span-2 flex items-center gap-x-2">
            <Button className="mt-auto text-sm" onClick={handleSearchCode}>
              Search Code
            </Button>
          </div>
          {editingAddress.address.map((addr, i) => (
            <label
              key={`edit-address-${editingAddress.code}-${i}`}
              className="col-span-6"
            >
              <span className="block font-medium">Address {i + 1}</span>
              <input
                type="text"
                value={addr}
                onChange={(e) => handleAddressChange(e, i)}
                className="w-full p-1 border border-gray-300 rounded"
                maxLength={21}
                aria-label="Address"
              />
            </label>
          ))}
          <label className="col-span-6">
            <span className="block font-medium">Company</span>
            <input
              type="text"
              name="company"
              value={editingAddress.company}
              onChange={handleChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={21}
              aria-label="Company"
            />
          </label>
          <label className="col-span-5">
            <span className="block font-medium">Name</span>
            <input
              type="text"
              name="name"
              value={editingAddress.name}
              onChange={handleChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={19}
              aria-label="Name"
            />
          </label>
          <label className="col-span-1">
            <span className="block font-medium">Title</span>
            <input
              type="text"
              name="title"
              value={editingAddress.title}
              onChange={handleChange}
              className="w-full p-1 border border-gray-300 rounded"
              maxLength={2}
              aria-label="Title"
            />
          </label>
          <label className="col-span-6">
            <span className="block font-medium">Enclosure</span>
            <input
              type="text"
              name="enclosure"
              value={editingAddress.enclosure}
              onChange={handleChange}
              className="w-full p-1 border border-gray-300 rounded"
              aria-label="Enclosure"
              placeholder="〇〇在中"
            />
          </label>
          <div className="col-span-6 flex items-center gap-x-4 mt-2">
            <input
              className="w-24 mr-auto px-3 py-2 border border-gray-300 rounded"
              type="number"
              value={count}
              onChange={(e) => setCount(Number.parseInt(e.target.value))}
              min={1}
              aria-label="Count"
            />
            <Button
              onClick={handleAdd}
              disabled={editingAddress.code.length < 7 || count < 1}
            >
              Add
            </Button>
            <Button onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </div>
      <div className="my-2 flex items-center gap-x-4">
        <h2 className="text-lg font-bold mr-auto">Address List</h2>
        <Button onClick={handleDownload} disabled={addressList.length === 0}>
          Download
        </Button>
        <Button onClick={handleUpload}>Upload</Button>
        <Button
          onClick={() => handlePrint()}
          disabled={addressList.length === 0}
        >
          Print
        </Button>
      </div>
      {addressList.length > 0 && (
        <table className="w-full mb-4 border-collapse table-auto">
          <tbody>
            {addressList.map((addr, index) => (
              <tr key={`${addr.code}-${addr.name}-${index}`}>
                <td className="border p-1 text-center max-w-12">{index + 1}</td>
                <td className="border p-1 max-w-32">
                  {insertHyphen(addr.code)}
                </td>
                <td className="border p-1 text-sm">
                  {addr.address.join(" ")}
                  <br />
                  {[
                    addr.company,
                    `${addr.name}${addr.title.length > 0 ? `　${addr.title}` : ""}`,
                  ].join(" ")}
                  {addr.enclosure && (
                    <div className="inline-block text-sm text-red-500 ml-4">
                      {addr.enclosure}
                    </div>
                  )}
                </td>
                <td className="border p-1 flex items-center justify-center gap-x-1 max-w-20">
                  <CharButton
                    className="p-1"
                    char="↑"
                    onClick={() => handleApply(index)}
                  />
                  <CrossButton
                    className="p-1"
                    onClick={() => handleRemove(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="hidden">
        <div
          ref={printRef}
          className="bg-white p-4 flex flex-wrap"
          style={{ fontFamily: "ui-serif, serif" }}
        >
          {addressList.map((addr, index) => (
            <div
              className="border p-4 w-[100mm] min-h-[50mm] flex flex-col"
              key={`card-${addr.code}-${index}`}
            >
              <p className="text-base font-bold mb-1">
                <span className="text-sm mr-1">〒</span>
                {insertHyphen(addr.code)}
              </p>
              {addr.address.map((line, i) => (
                <p key={`${addr.code}-line-${i}`}>
                  {line.length > 0 ? line : "　"}
                </p>
              ))}
              {addr.company.length > 0 && (
                <p className="mt-1">{addr.company}</p>
              )}
              <p className={addr.company.length > 0 ? "" : "mt-1"}>
                {addr.name}　{addr.title}
              </p>
              {addr.enclosure && (
                <div className="mt-2 ml-auto px-2 py-1 border-2 border-red-500">
                  <p className="text-red-500 font-bold">{addr.enclosure}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
