import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Card component with sub-components for structured content
 *
 * @param {Object} props - Component props
 * @param {'default' | 'elevated' | 'outlined'} props.variant - Card style variant
 * @param {'none' | 'sm' | 'md' | 'lg'} props.padding - Card padding size
 * @param {boolean} props.hoverable - Whether card has hover effects
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 */
export default function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  children,
  className,
  ...props
}) {
  const baseStyles = "rounded-lg transition-all duration-300";

  const variants = {
    default: "bg-white border border-border-light",
    elevated: "bg-white shadow-md hover:shadow-lg",
    outlined: "bg-transparent border-2 border-border-medium",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const hoverStyles = hoverable
    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    : "";

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverStyles,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader sub-component
 */
export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn("p-4 border-b border-border-light", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardBody sub-component
 */
export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * CardFooter sub-component
 */
export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn("p-4 border-t border-border-light", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardImage sub-component
 */
export function CardImage({ src, alt, className, ...props }) {
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-t-lg", className)}
    >
      <Image
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        {...props}
      />
    </div>
  );
}
