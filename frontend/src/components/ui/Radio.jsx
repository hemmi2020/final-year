import { cn } from "@/lib/utils";

/**
 * Radio button component
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Radio label text
 * @param {string} props.name - Radio group name
 * @param {string} props.value - Radio value
 * @param {boolean} props.checked - Whether radio is checked
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Whether radio is disabled
 * @param {string} props.className - Additional CSS classes
 */
export default function Radio({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className,
  id,
  ...props
}) {
  const radioId = id || `radio-${name}-${value}`;

  return (
    <div className={cn("flex items-center", className)}>
      <input
        id={radioId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "min-w-[44px] min-h-[44px] w-5 h-5 text-primary-600 border-border-medium focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-150",
          disabled && "opacity-60 cursor-not-allowed",
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={radioId}
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
