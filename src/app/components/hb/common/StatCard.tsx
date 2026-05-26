/**
 * STAT CARD COMPONENT
 * 
 * Displays key metrics in a clean card format
 * Used in dashboards and overview pages
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon,
  trend,
  className,
  valueClassName 
}: StatCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">
            {label}
          </p>
          <p className={cn(
            "text-2xl font-semibold text-neutral-900 dark:text-white",
            valueClassName
          )}>
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-xs mt-1.5",
              trend.positive 
                ? "text-success-600 dark:text-success-400" 
                : "text-error-600 dark:text-error-400"
            )}>
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>
    </div>
  );
}
