// components/form/FormSubmitButton.tsx
interface SubmitProps {
  label: string;
  className?: string;
}

const FormSubmitButton = ({ label, className = "" }: SubmitProps) => (
  <button
    type="submit"
    className={`bg-blue-600 text-white py-3 p6 w-[10%] rounded-xs font-semibold ${className}`}
  >
    {label}
  </button>
);

export default FormSubmitButton;
