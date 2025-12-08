"use client";
import { FaChevronDown } from "react-icons/fa";

interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string | number;
  placeholder: string;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function FormSelect({
  label,
  name,
  value,
  placeholder,
  options,
  onChange,
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-2 relative">
  <label className="text-sm font-medium">{label}</label>

  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full border border-[#7A8A98] px-4 py-3 pr-10 bg-white text-[#7A8A98] appearance-none rounded"
  >
    <option value="" disabled>
      {placeholder}
    </option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>

  {/* Custom arrow */}
  <FaChevronDown className="absolute right-3 top-[70%] text-sm transform -translate-y-1/2 text-[#7A8A98]" />
</div>


  );
}
