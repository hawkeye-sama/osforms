import * as React from "react";
import { Input, InputProps } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends Omit<InputProps, "id"> {
  label: string;
  name: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, name, helperText, required, containerClassName, state, errorMessage, className, ...props }, ref) => {
    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        <Label htmlFor={name} className={cn(
          "transition-colors duration-150",
          state === "error" && "text-red-500",
          state === "success" && "text-green-500"
        )}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        <Input
          id={name}
          name={name}
          ref={ref}
          state={state}
          errorMessage={errorMessage}
          className={className}
          aria-required={required}
          aria-invalid={state === "error"}
          aria-describedby={helperText ? `${name}-helper` : errorMessage ? `${name}-error` : undefined}
          {...props}
        />
        {helperText && state !== "error" && (
          <p id={`${name}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
