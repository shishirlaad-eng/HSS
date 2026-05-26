import { Info } from 'lucide-react';
import { cn } from '../../ui/utils';

interface ReadOnlyBannerProps {
  message: string;
  className?: string;
}

export function ReadOnlyBanner({ message, className }: ReadOnlyBannerProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 rounded-lg mb-6",
      className
    )}>
      <div className="flex-shrink-0">
        <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
      </div>
      <p className="text-sm text-primary-900 dark:text-primary-100 leading-relaxed">
        {message}
      </p>
    </div>
  );
}
