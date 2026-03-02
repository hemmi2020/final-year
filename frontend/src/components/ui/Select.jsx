import { cn } from "@/lib/utils";

/**
 * Select component for dropdown selection
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Select label text
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of options {value, label}
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Whether select is disabled
 * @param {boolean} props.required - Whether select is required
 * @param {string} props.helperText - Helper text below select
 * @param {string} props.className - Additional CSS classes
 */
export default function Select({
  label,
  placeholder,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  helperText,
  className,
  id,
  ...props
}) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  const baseStyles =
    "w-full px-3 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none bg-white";
  const normalStyles =
    "border-border-medium focus:border-primary-500 focus:ring-primary-500";
  const errorStyles =
    "border-error-500 focus:border-error-500 focus:ring-error-500";
  const disabledStyles = "bg-neutral-100 cursor-not-allowed opacity-60";

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            baseStyles,
            error ? errorStyles : normalStyles,
            disabled && disabledStyles,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-sm text-error-600">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
