/**
 * REUSABLE FORM TEMPLATES
 * 
 * Standardized, generic form components for modal forms.
 * Includes Modal wrapper, Labels, Grids, and Footer actions.
 * Can be used for any form type - completely data-agnostic.
 */

import { useEffect, forwardRef } from "react";
import { X, ChevronDown, Calendar } from "lucide-react";
import { cn } from "../../ui/utils";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { SelectContent, SelectTrigger, SelectItem } from "../../ui/select";

// --- Form Modal ---

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  description?: string;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  description
}: FormModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={cn(
        "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full flex flex-col",
        "max-h-[90vh]",
        maxWidth
      )}>
        {/* Header — always visible, never scrolls */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">{title}</h3>
            {description && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body — scrollable when content overflows */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Form Components ---

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

export function FormLabel({ children, required, className, htmlFor }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn("text-xs text-neutral-700 dark:text-neutral-300 block mb-1.5", className)}
    >
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

interface FormGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ children, cols = 1, className }: FormGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3.5", gridClasses[cols], className)}>
      {children}
    </div>
  );
}

interface FormFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFooter({ children, className }: FormFooterProps) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800", className)}>
      {children}
    </div>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {children}
    </div>
  );
}

// --- Form Inputs ---

export const FormInput = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, type, ...props }, ref) => {
    // Special handling for date inputs
    if (type === 'date') {
      return (
        <div className="relative">
          <Input 
            ref={ref}
            type="date"
            className={cn(
              "h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg pr-10",
              // Hide native calendar icon
              "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
              className
            )} 
            {...props} 
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calendar className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
          </div>
        </div>
      );
    }

    return (
      <Input 
        ref={ref}
        type={type}
        className={cn(
          "h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg", 
          className
        )} 
        {...props} 
      />
    );
  }
);
FormInput.displayName = "FormInput";

export const FormTextarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof Textarea>>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea 
        ref={ref}
        className={cn(
          "min-h-[80px] w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all", 
          className
        )} 
        {...props} 
      />
    );
  }
);
FormTextarea.displayName = "FormTextarea";

export const FormTextArea = FormTextarea;

export const FormSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-10 w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white appearance-none",
            "focus:outline-none focus:border-primary-500 dark:focus:border-primary-600 focus:shadow-lg focus:shadow-primary-500/10 dark:focus:shadow-primary-600/20",
            "transition-[border-color,box-shadow]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
        </div>
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

export const FormSelectTrigger = forwardRef<HTMLButtonElement, React.ComponentProps<typeof SelectTrigger>>(
  ({ className, children, ...props }, ref) => {
    return (
      <SelectTrigger 
        ref={ref}
        className={cn(
          "h-10 w-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg", 
          className
        )} 
        {...props}
      >
        {children}
      </SelectTrigger>
    );
  }
);
FormSelectTrigger.displayName = "FormSelectTrigger";

export const FormSelectContent = forwardRef<HTMLDivElement, React.ComponentProps<typeof SelectContent>>(
  ({ className, children, ...props }, ref) => {
    return (
      <SelectContent 
        ref={ref}
        className={cn(
          "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md", 
          className
        )} 
        {...props}
      >
        {children}
      </SelectContent>
    );
  }
);
FormSelectContent.displayName = "FormSelectContent";

export const FormSelectItem = forwardRef<HTMLDivElement, React.ComponentProps<typeof SelectItem>>(
  ({ className, children, ...props }, ref) => {
    return (
      <SelectItem 
        ref={ref}
        className={cn(
          "py-2.5 pl-4 pr-8 cursor-pointer focus:bg-primary-50 dark:focus:bg-primary-950/50 focus:text-primary-900 dark:focus:text-primary-100 text-neutral-700 dark:text-neutral-300 first:rounded-t-lg last:rounded-b-lg", 
          className
        )} 
        {...props}
      >
        {children}
      </SelectItem>
    );
  }
);
FormSelectItem.displayName = "FormSelectItem";

// --- Form Layout Containers ---

interface FormCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function FormCard({ children, title, description, className, icon: Icon }: FormCardProps) {
  return (
    <div className={cn("bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6", className)}>
      {(title || description) && (
        <div className="mb-6">
           {title && (
             <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
               {Icon && <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />}
               {title}
             </h3>
           )}
           {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function FormSection({ children, className, title }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}