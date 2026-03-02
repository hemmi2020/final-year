import { cn } from "@/lib/utils";

/**
 * Checkbox component
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Checkbox label text
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Whether checkbox is disabled
 * @param {string} props.className - Additional CSS classes
 */
export default function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className,
  id,
  ...props
}) {
  const checkboxId =
    id || `checkbox-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={cn("flex items-center", className)}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "min-w-[44px] min-h-[44px] w-5 h-5 text-primary-600 border-border-medium rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-150",
          disabled && "opacity-60 cursor-not-allowed",
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            "ml-2 text-sm text-neutral-700",
            disabled && "opacity-60 cursor-not-allowed",
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
