import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Status badge variants - dot pattern (preferred for tables/reports)
        "status-dot":
          "rounded-full gap-1.5 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400",
        // Full color variants (for listing pages)
        success:
          "border-transparent rounded-full bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400",
        warning:
          "border-transparent rounded-full bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-400",
        error:
          "border-transparent rounded-full bg-error-100 dark:bg-error-950 text-error-700 dark:text-error-400",
        info:
          "border-transparent rounded-full bg-info-100 dark:bg-info-950 text-info-700 dark:text-info-400",
        neutral:
          "border-transparent rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

// Status dot component for badge with dot indicator
function StatusDot({ color = "neutral" }: { color?: "success" | "warning" | "error" | "info" | "neutral" }) {
  const colorClasses = {
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
    info: "bg-info-500",
    neutral: "bg-neutral-400",
  };

  return (
    <div className={cn("w-1.5 h-1.5 rounded-full", colorClasses[color])} />
  );
}

export { Badge, badgeVariants, StatusDot };