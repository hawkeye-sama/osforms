import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: "default" | "success" | "error";
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = "default", errorMessage, ...props }, ref) => {
    const [shouldShake, setShouldShake] = React.useState(false);

    React.useEffect(() => {
      if (state === "error") {
        setShouldShake(true);
        const timer = setTimeout(() => setShouldShake(false), 400);
        return () => clearTimeout(timer);
      }
    }, [state]);

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            state === "default" && "border-border focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-border",
            state === "success" && "border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20 pr-10",
            state === "error" && "border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 pr-10",
            shouldShake && "animate-shake",
            className
          )}
          ref={ref}
          {...props}
        />
        {state === "success" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="h-4 w-4 text-green-500 animate-scale-in" />
          </div>
        )}
        {state === "error" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-red-500 animate-scale-in" />
          </div>
        )}
        {state === "error" && errorMessage && (
          <p className="mt-1.5 text-xs text-red-500 animate-fade-in">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
