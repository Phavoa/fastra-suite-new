// components/form/FormInput.tsx
import React from "react";

interface FormInputProps {
  label?: string;
  name: string;
  value?: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  required?: boolean; // ✅ optional prop
}

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  required = false, // default to false
}: FormInputProps) => {
  const isTextArea = type === "textarea";

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-[#1A1A1A] font-medium mb-1">{label}</label>}

      {isTextArea ? (
        <textarea
          name={name}
          value={value as string}
          onChange={onChange}
          placeholder={placeholder}
          required={required} // ✅ apply required
          className={`border rounded-lg p-3 text-[#7A8A98] ${className}`}
        />
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          name={name}
          checked={value as boolean}
          onChange={onChange}
          className={`h-5 w-5 ${className}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value as string | number}
          onChange={onChange}
          placeholder={placeholder}
          required={required} // ✅ apply required
          className={`border border-[#7A8A98] text-[#7A8A98] rounded-xs p-3 ${className}`}
        />
      )}
    </div>
  );
};

export default FormInput;
