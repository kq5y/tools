import { type ComponentPropsWithoutRef, useMemo } from "react";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  colorType?: "normal" | "error";
}

export function Button({
  className,
  type = "button",
  colorType = "normal",
  ...props
}: ButtonProps) {
  const twClassName = useMemo(() => {
    let cn =
      "px-3 py-2 text-white rounded disabled:cursor-not-allowed transition";
    if (colorType === "normal") {
      cn += " bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300";
    } else if (colorType === "error") {
      cn += " bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300";
    }
    if (className) {
      cn += ` ${className}`;
    }
    return cn.trim();
  }, [colorType, className]);
  return <button {...props} type={type} className={twClassName} />;
}

interface CrossButtonProps extends ComponentPropsWithoutRef<"button"> {}

export function CrossButton({ className, ...props }: CrossButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={`font-bold text-2xl text-red-600 hover:text-red-800 disabled:text-red-300 transition ${className || ""}`}
    >
      x
    </button>
  );
}

interface TabButtonProps extends ComponentPropsWithoutRef<"button"> {
  selected: boolean;
}

export function TabButton({ className, selected, ...props }: TabButtonProps) {
  const twClassName = useMemo(() => {
    let cn = "inline-block p-2 border-b-2 rounded-t-lg";
    if (selected) {
      cn += " text-indigo-600 hover:text-indigo-600 border-indigo-600";
    } else {
      cn +=
        " text-gray-500 hover:text-gray-600 border-gray-100 hover:border-gray-300";
    }
    if (className) {
      cn += ` ${className}`;
    }
    return cn.trim();
  }, [selected, className]);
  return <button {...props} type="button" className={twClassName} />;
}
