import type { MetaFunction } from "@remix-run/cloudflare";
import { useEffect, useMemo, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "/school/dakoku" },
    { name: "description", content: "Lecture attendance management" },
  ];
};

type AttendanceStatus = "o" | "x" | "-" | "~";

interface SaveData {
  lectures: {
    name: string;
    attendances: AttendanceStatus[][];
  }[];
}

const attendanceOptions: AttendanceStatus[] = ["o", "x", "-", "~"];

export default function Dakoku() {
  const [data, setData] = useState<SaveData>({ lectures: [] });
  const [addLectureName, setAddLectureName] = useState("");
  const [addLectureTimes, setAddLectureTimes] = useState(1);
  const [nameRowWidth, setNameRowWidth] = useState(100);
  const tableNameRowRef = (tableNameRow: HTMLTableCellElement | null) => {
    if (!tableNameRow) return;
    setNameRowWidth(tableNameRow.clientWidth);
  };
  useEffect(() => {
    const savedData = JSON.parse(
      localStorage.getItem("attendanceData") || '{"lectures": []}'
    );
    setData(savedData);
  }, []);
  const saveToLocalStorage = (data: SaveData) => {
    localStorage.setItem("attendanceData", JSON.stringify(data));
  };
  const handleAddLecture = () => {
    if (addLectureName.length === 0 || addLectureTimes <= 0) return;
    const newLecture = {
      name: addLectureName,
      attendances: [...Array(addLectureTimes).fill([...Array(15).fill("-")])],
    };
    setData((prevData) => ({
      ...prevData,
      lectures: [...prevData.lectures, newLecture],
    }));
    saveToLocalStorage({ ...data, lectures: [...data.lectures, newLecture] });
    setAddLectureName("");
  };
  const handleDeleteLecture = (index: number) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    const updatedLectures = data.lectures.filter((_, i) => i !== index);
    setData((prevData) => ({ ...prevData, lectures: updatedLectures }));
    saveToLocalStorage({ ...data, lectures: updatedLectures });
  };
  const handleChangeAttendance = (
    lectureIndex: number,
    timesIndex: number,
    classIndex: number,
    status: AttendanceStatus
  ) => {
    const updatedLectures = data.lectures.map((lecture, i) => {
      if (i === lectureIndex) {
        const updatedAttendance = [...lecture.attendances];
        updatedAttendance[timesIndex][classIndex] = status;
        return { ...lecture, attendances: updatedAttendance };
      }
      return lecture;
    });
    setData((prevData) => ({ ...prevData, lectures: updatedLectures }));
    saveToLocalStorage({ ...data, lectures: updatedLectures });
  };
  const handleResetData = () => {
    if (!window.confirm("Are you sure you want to reset?")) return;
    setData({ lectures: [] });
    localStorage.removeItem("attendanceData");
  };
  const attendanceSummary = useMemo(() => {
    return data.lectures.map((lecture) => {
      const attended = lecture.attendances
        .flat()
        .filter((status) => status === "o").length;
      const absent = lecture.attendances
        .flat()
        .filter((status) => status === "x").length;
      const totalClasses = lecture.attendances
        .flat()
        .filter((status) => status !== "~").length;
      const attendanceRate =
        totalClasses > 0 ? (attended / totalClasses) * 100 : 0;
      return {
        name: lecture.name,
        attended,
        absent,
        totalClasses,
        attendanceRate: `${attendanceRate.toFixed(2)}%`,
      };
    });
  }, [data.lectures]);
  const status2bgColor = (status: AttendanceStatus) => {
    if (status === "o") return "bg-green-200";
    if (status === "x") return "bg-red-200";
    if (status === "~") return "bg-gray-400";
    return "";
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">Dakoku</h1>
      <div className="p-2">
        <div className="mb-2 overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded-lg shadow-md border-separate border-spacing-0 table-fixed">
            <thead>
              <tr className="text-base">
                <th
                  ref={tableNameRowRef}
                  className="sticky left-0 bg-white px-4 py-2 text-left"
                >
                  Name
                </th>
                <th
                  className="sticky bg-white px-4 py-2 text-left"
                  style={{ left: nameRowWidth }}
                />
                {Array.from({ length: 15 }, (_, i) => (
                  <th key={i.toString()} className="px-4 py-2 text-center">
                    {i + 1}
                  </th>
                ))}
                <th className="sticky right-0 bg-white px-4 py-2">Del</th>
              </tr>
            </thead>
            <tbody>
              {data.lectures.map((lecture, lectureIndex) =>
                lecture.attendances.map((att, times) => (
                  <tr
                    key={(lectureIndex * 10 + times).toString()}
                    className="hover:bg-gray-50"
                  >
                    {times === 0 && (
                      <td
                        rowSpan={lecture.attendances.length}
                        colSpan={lecture.attendances.length >= 2 ? 1 : 2}
                        className={`sticky left-0 bg-white px-4 py-2 ${
                          lecture.attendances.length >= 2
                            ? "w-[100px]"
                            : "w-[140px]"
                        }`}
                      >
                        {lecture.name}
                      </td>
                    )}
                    {lecture.attendances.length >= 2 && (
                      <td
                        className="sticky bg-white px-4 py-2"
                        style={{ left: nameRowWidth }}
                      >
                        {times + 1}
                      </td>
                    )}
                    {att.map((status, i) => (
                      <td
                        key={i.toString()}
                        className={`px-4 py-2 text-center ${status2bgColor(status)}`}
                      >
                        <select
                          value={status}
                          onChange={(e) =>
                            handleChangeAttendance(
                              lectureIndex,
                              times,
                              i,
                              e.target.value as AttendanceStatus
                            )
                          }
                          className="rounded-md p-1"
                        >
                          {attendanceOptions.map((option) => (
                            <option key={option} value={option}>
                              {option === "o"
                                ? "○"
                                : option === "x"
                                  ? "✕"
                                  : option === "-"
                                    ? "ー"
                                    : "休"}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                    {times === 0 && (
                      <td
                        rowSpan={lecture.attendances.length}
                        className="sticky right-0 bg-white px-4 py-2 text-center"
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteLecture(lectureIndex)}
                          className="font-bold text-2xl text-red-600 hover:text-red-800 transition"
                        >
                          x
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mb-2 flex">
          <input
            type="text"
            placeholder="Lecture name"
            className="border bg-white border-gray-300 p-2 flex-grow rounded-l-md"
            value={addLectureName}
            onChange={(e) => setAddLectureName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Times"
            className="border bg-white border-gray-300 p-2 flex-grow"
            min={1}
            max={7}
            value={addLectureTimes}
            onChange={(e) => setAddLectureTimes(Number(e.target.value))}
          />
          <button
            type="button"
            onClick={handleAddLecture}
            className="bg-indigo-500 text-white px-4 rounded-r-md hover:bg-indigo-600 transition"
          >
            Add
          </button>
        </div>
        <div className="mb-2 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Attended
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Absent
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Total
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceSummary.map((summary, index) => (
                <tr
                  key={index.toString()}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {summary.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {summary.attended}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {summary.absent}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {summary.totalClasses}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {summary.attendanceRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-2">
          <button
            type="button"
            onClick={handleResetData}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
