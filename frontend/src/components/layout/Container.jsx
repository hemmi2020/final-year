import { cn } from "@/lib/utils";

/**
 * Container component for consistent max-width and padding
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Container content
 * @param {string} props.className - Additional CSS classes
 */
export default function Container({ children, className, ...props }) {
  return (
    <div
      className={cn("w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}
