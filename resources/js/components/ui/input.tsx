import * as React from "react";
import { cn } from "@/lib/utils";
interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  success?: boolean;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors duration-200",
          error && "border-destructive focus-visible:ring-destructive/30 bg-destructive/5",
          success && "border-success focus-visible:ring-success/30 bg-success/5",
          className,
        )}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
export { Input };


