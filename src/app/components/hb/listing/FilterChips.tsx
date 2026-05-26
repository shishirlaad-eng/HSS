/**
 * FILTER CHIPS COMPONENT
 * 
 * Displays active filters as removable chips/tags
 * Shows users what filters are currently applied
 * 
 * USAGE:
 * <FilterChips
 *   filters={filterConditions}
 *   onRemove={(filterId) => handleRemoveFilter(filterId)}
 *   onClearAll={() => setFilters([])}
 * />
 */

import { X } from 'lucide-react';
import type { FilterCondition } from './FilterPopup';

interface FilterChipsProps {
  filters: FilterCondition[];
  onRemove: (filterId: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  // Only show filters that have values
  const activeFilters = filters.filter(f => f.values.length > 0);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
      {/* Single Row: Label + Chips + Clear All */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-wide font-medium text-neutral-500 dark:text-neutral-400">
          Filtered by ({activeFilters.length}):
        </span>
        
        {activeFilters.map((filter) => (
          <div
            key={filter.id}
            className="flex items-center gap-1.5 h-6 px-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/50 rounded text-[11px] text-primary-700 dark:text-primary-300"
          >
            <span className="font-medium">{filter.field}:</span>
            <span className="capitalize max-w-[200px] truncate">{filter.values.join(', ')}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors flex-shrink-0"
              title="Remove filter"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        
        {activeFilters.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline transition-colors ml-auto"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}