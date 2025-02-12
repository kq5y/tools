import { type ComponentPropsWithoutRef, type ReactNode, useMemo } from "react";

interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  colorType?: "normal" | "error" | "none";
  children?: ReactNode;
}

export function Checkbox({
  className,
  colorType = "normal",
  children,
  ...props
}: CheckboxProps) {
  const twClassName = useMemo(() => {
    let cn = "rounded disabled:cursor-not-allowed transition";
    if (colorType === "normal") {
      cn +=
        " accent-indigo-500 hover:accent-indigo-600 disabled:accent-indigo-300";
    } else if (colorType === "error") {
      cn += " accent-rose-500 hover:accent-rose-600 disabled:accent-rose-300";
    }
    if (className) {
      cn += ` ${className}`;
    }
    return cn.trim();
  }, [className]);
  if (children) {
    return (
      <label className="flex flex-row items-center gap-1">
        <input {...props} type="checkbox" className={twClassName} />
        <div>{children}</div>
      </label>
    );
  }
  return <input {...props} type="checkbox" className={twClassName} />;
}
