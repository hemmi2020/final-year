import { cn } from "@/lib/utils";

/**
 * Textarea component for multi-line text input
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Textarea label text
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Whether textarea is disabled
 * @param {boolean} props.required - Whether textarea is required
 * @param {string} props.helperText - Helper text below textarea
 * @param {number} props.rows - Number of rows
 * @param {string} props.className - Additional CSS classes
 */
export default function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helperText,
  rows = 4,
  className,
  id,
  ...props
}) {
  const textareaId =
    id || `textarea-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  const baseStyles =
    "w-full px-3 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical";
  const normalStyles =
    "border-border-medium focus:border-primary-500 focus:ring-primary-500";
  const errorStyles =
    "border-error-500 focus:border-error-500 focus:ring-error-500";
  const disabledStyles = "bg-neutral-100 cursor-not-allowed opacity-60";

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
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
