/**
 * SELECT COMPONENT
 * 
 * Custom select dropdown component following application design guidelines
 * Consistent styling with Input component
 */

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../ui/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "appearance-none w-full h-9 rounded-lg px-3 py-1 pr-9 text-sm",
            "bg-white dark:bg-neutral-900",
            "border border-neutral-200 dark:border-neutral-700",
            "text-neutral-900 dark:text-neutral-100",
            "focus:outline-none focus:border-primary-500 dark:focus:border-primary-600 focus:shadow-lg focus:shadow-primary-500/10 dark:focus:shadow-primary-600/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-[border-color,box-shadow]",
            error && "border-error-500 dark:border-error-600 focus:border-error-500 focus:shadow-error-500/10",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 dark:text-neutral-400 pointer-events-none" />
      </div>
    );
  }
);

Select.displayName = "Select";