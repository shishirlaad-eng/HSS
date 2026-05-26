/**
 * REUSABLE SEARCH BAR COMPONENT
 * 
 * Gmail-style expandable search bar with advanced filters
 * 
 * SPECIFICATIONS:
 * 
 * COLLAPSED STATE (Icon Button):
 * - Size: 40px × 40px (w-10 h-10)
 * - Border: 1px solid neutral-200 (dark: neutral-800)
 * - Hover Border: primary-300 (dark: primary-700)
 * - Border Radius: 8px (rounded-lg)
 * - Background: white (dark: neutral-950)
 * - Icon Size: 20px × 20px (w-5 h-5)
 * - Icon Color: neutral-600 (dark: neutral-400)
 * - Transition: all properties (transition-all)
 * 
 * EXPANDED STATE (Search Input):
 * - Min Width: 320px (min-w-[320px])
 * - Padding: 8px 16px (px-4 py-2)
 * - Border: 1px solid neutral-300 (dark: neutral-700)
 * - Border Radius: 8px (rounded-lg)
 * - Shadow: shadow-sm
 * - Background: white (dark: neutral-950)
 * - Icon Size: 16px × 16px (w-4 h-4)
 * - Icon Color: neutral-400 (dark: neutral-600)
 * - Text Color: neutral-900 (dark: white)
 * - Placeholder Color: neutral-400 (dark: neutral-600)
 * - Gap: 8px (gap-2)
 * - Auto Focus: Yes
 * 
 * ADVANCED FILTER BUTTON:
 * - Padding: 4px (p-1)
 * - Color: neutral-600 (dark: neutral-400)
 * - Hover Color: primary-600 (dark: primary-400)
 * - Border Radius: default (rounded)
 * - Transition: colors (transition-colors)
 * 
 * CLOSE BUTTON:
 * - Color: neutral-600 (dark: neutral-400)
 * - Hover Color: neutral-900 (dark: white)
 * - Font Size: 14px (text-sm)
 * 
 * USAGE:
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onAdvancedSearch={() => setShowAdvanced(true)}
 * />
 */

import { useState } from 'react';
import { Search, Filter, X, Columns3 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAdvancedSearch?: () => void;
  onToggleColumns?: () => void;
  className?: string;
  activeFilterCount?: number;  // Number of active filters
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...',
  onAdvancedSearch,
  onToggleColumns,
  activeFilterCount = 0,
  className = '' 
}: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = () => {
    setIsExpanded(false);
    onChange('');
  };

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(true)}
          className={`
            w-10 h-10 
            flex items-center justify-center 
            text-neutral-600 dark:text-neutral-400 
            bg-white dark:bg-neutral-950 
            border border-neutral-200 dark:border-neutral-800 
            hover:border-primary-300 dark:hover:border-primary-700 
            rounded-lg 
            transition-all
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {onToggleColumns && (
          <button
            onClick={onToggleColumns}
            className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg transition-all"
            title="Customize Columns"
          >
            <Columns3 className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} data-flyout-container>
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm min-w-[320px]">
        <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none"
          autoFocus
        />
        <div className="flex items-center gap-1">
          {onAdvancedSearch && (
            <button
              onClick={onAdvancedSearch}
              className="relative p-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
              title="Advanced Search"
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          {onToggleColumns && (
            <button
              onClick={onToggleColumns}
              className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
              title="Customize Columns"
            >
              <Columns3 className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}