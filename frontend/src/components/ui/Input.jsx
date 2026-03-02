import { cn } from "@/lib/utils";

/**
 * Input component for text-based form inputs
 *
 * @param {Object} props - Component props
 * @param {'text' | 'email' | 'password' | 'number' | 'tel' | 'url'} props.type - Input type
 * @param {string} props.label - Input label text
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.helperText - Helper text below input
 * @param {string} props.className - Additional CSS classes
 */
export default function Input({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helperText,
  className,
  id,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  const baseStyles =
    "w-full px-3 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const normalStyles =
    "border-border-medium focus:border-primary-500 focus:ring-primary-500";
  const errorStyles =
    "border-error-500 focus:border-error-500 focus:ring-error-500";
  const disabledStyles = "bg-neutral-100 cursor-not-allowed opacity-60";

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          baseStyles,
          error ? errorStyles : normalStyles,
          disabled && disabledStyles,
        )}
        {...props}
      />
      {error && <p className="text-sm text-error-600">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
