import { type ChangeEvent, type InputHTMLAttributes, useState } from "react";

interface ValidatedNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  onChange?: (value: number) => void;
  validate?: (value: number) => boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export function ValidatedNumberInput({
  value,
  onChange,
  validate,
  disabled = false,
  min,
  max,
  ...inputProps
}: ValidatedNumberInputProps) {
  const [editValue, setEditValue] = useState<string>(value.toString());
  const isValid = (n: number) => {
    if (min !== undefined && n < min) return false;
    if (max !== undefined && n > max) return false;
    return validate ? validate(n) : true;
  };
  const handleBlur = () => {
    const n = Number.parseInt(editValue);
    if (Number.isNaN(n) || !isValid(n)) {
      setEditValue(value.toString());
      onChange?.(value);
    } else {
      onChange?.(n);
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  return (
    <input
      {...inputProps}
      type="text"
      className={`border p-1 rounded${inputProps.className ? ` ${inputProps.className}` : ""}`}
      value={editValue}
      onBlur={handleBlur}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
