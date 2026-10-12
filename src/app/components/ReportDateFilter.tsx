// ─────────────────────────────────────────────────────────────
// HSS UK — Report date filter
// Same date search as the other modules (e.g. All Members › Reg. Date): a button that opens
// the shared DateRangeFilter with quick-select presets and a custom start/end range.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { DateRangeFilter } from './hb/listing';
import { formatDateRange } from '../../utils/formatDate';

/** True when `value` (ISO date or datetime) falls inside the inclusive start/end range; no range = always true. */
export function inDateRange(value: string | undefined, start: string, end: string): boolean {
  if (!start && !end) return true;
  if (!value) return false;
  const day = value.slice(0, 10);
  if (start && day < start) return false;
  if (end && day > end) return false;
  return true;
}

export default function ReportDateFilter({
  start,
  end,
  label,
  onChange,
  title,
  emptyLabel = 'Date',
  includeFuture = false,
}: {
  start: string;
  end: string;
  label: string;
  onChange: (start: string, end: string, label: string) => void;
  title: string;
  emptyLabel?: string;
  includeFuture?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = !!start;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={title}
        className={`h-9 px-3 flex items-center gap-1.5 text-sm rounded-lg border transition-colors ${
          active
            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
        }`}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        {active ? (label || formatDateRange(start, end)) : emptyLabel}
        {active && (
          <span
            role="button"
            aria-label="Clear date range"
            onClick={e => { e.stopPropagation(); onChange('', '', ''); }}
            className="ml-0.5 text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>
      <DateRangeFilter
        isOpen={open}
        onClose={() => setOpen(false)}
        startDate={start}
        endDate={end}
        onApply={(s, e, l) => onChange(s, e, l || '')}
        title={title}
        includeFuture={includeFuture}
      />
    </div>
  );
}
