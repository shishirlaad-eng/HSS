/**
 * REUSABLE FILTER DROPDOWN COMPONENT
 * 
 * Advanced multi-filter dropdown positioned below trigger button
 * Supports multiple filters with "+Add more" functionality
 * "What" dropdown supports multi-select with checkboxes
 * 
 * SPECIFICATIONS:
 * - Dropdown Width: 480px
 * - Max Height: 400px with scroll
 * - Position: Below trigger (right-aligned)
 * - Z-index: 40
 * 
 * USAGE:
 * <FilterPopup
 *   isOpen={showFilters}
 *   onClose={() => setShowFilters(false)}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   filterOptions={{
 *     'Job Status': ['Active', 'Exited', 'Suspended'],
 *     'Department': ['Engineering', 'Sales', 'HR']
 *   }}
 *   onApply={handleApplyFilters}
 * />
 */

import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronDown, Trash2, Check } from 'lucide-react';

export interface FilterCondition {
  id: string;
  field: string;  // "Where" - e.g., "Job Status"
  values: string[];  // "What" - e.g., ["Active", "Suspended"]
}

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  filterOptions: Record<string, string[]>;  // { "Job Status": ["Active", "Exited", "Suspended"] }
  onApply?: () => void;
  title?: string;
}

export function FilterPopup({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  filterOptions,
  onApply,
  title = 'Filter By'
}: FilterPopupProps) {
  const [localFilters, setLocalFilters] = useState<FilterCondition[]>(filters);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, 'field' | 'values' | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close individual dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(
        ref => !ref || !ref.contains(event.target as Node)
      );
      if (clickedOutside) {
        setOpenDropdowns({});
      }
    };

    if (Object.values(openDropdowns).some(v => v !== null)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdowns]);

  if (!isOpen) return null;

  const handleAddFilter = () => {
    const firstField = Object.keys(filterOptions)[0] || '';
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: firstField,
      values: []
    };
    setLocalFilters([...localFilters, newFilter]);
  };

  const handleRemoveFilter = (id: string) => {
    setLocalFilters(localFilters.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: string, field: string) => {
    setLocalFilters(localFilters.map(f => 
      f.id === id ? { ...f, field, values: [] } : f
    ));
    setOpenDropdowns({ ...openDropdowns, [id]: null });
  };

  const handleValueToggle = (id: string, value: string) => {
    setLocalFilters(localFilters.map(f => {
      if (f.id === id) {
        const newValues = f.values.includes(value)
          ? f.values.filter(v => v !== value)
          : [...f.values, value];
        return { ...f, values: newValues };
      }
      return f;
    }));
  };

  const handleApply = () => {
    // Filter out empty filters
    const validFilters = localFilters.filter(f => f.field && f.values.length > 0);
    onFiltersChange(validFilters);
    if (onApply) onApply();
    onClose();
  };

  const handleReset = () => {
    setLocalFilters([]);
  };

  const toggleDropdown = (id: string, dropdown: 'field' | 'values') => {
    setOpenDropdowns({
      ...openDropdowns,
      [id]: openDropdowns[id] === dropdown ? null : dropdown
    });
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-[480px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        
        {/* Filter Conditions */}
        {localFilters.length > 0 ? (
          <div className="space-y-2 mb-3">
            {localFilters.map((filter, index) => (
              <div key={filter.id} className="flex items-start gap-2">
                
                {/* Where Dropdown */}
                <div className="flex-1 relative">
                  {index === 0 && (
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      Where
                    </label>
                  )}
                  <button
                    onClick={() => toggleDropdown(filter.id, 'field')}
                    className="w-full h-8 px-3 flex items-center justify-between bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                    style={{ marginTop: index === 0 ? 0 : '17px' }}
                  >
                    <span className={filter.field ? '' : 'text-neutral-400 dark:text-neutral-600'}>
                      {filter.field || 'Select...'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {/* Where Dropdown Menu */}
                  {openDropdowns[filter.id] === 'field' && (
                    <div ref={el => dropdownRefs.current[`${filter.id}-field`] = el} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                      {Object.keys(filterOptions).map((field) => (
                        <button
                          key={field}
                          onClick={() => handleFieldChange(filter.id, field)}
                          className="w-full px-3 py-1.5 text-left text-sm text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between first:rounded-t-lg last:rounded-b-lg"
                        >
                          <span>{field}</span>
                          {filter.field === field && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* What Dropdown (Multi-select with checkboxes) */}
                <div className="flex-1 relative">
                  {index === 0 && (
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      What
                    </label>
                  )}
                  <button
                    onClick={() => toggleDropdown(filter.id, 'values')}
                    disabled={!filter.field}
                    className="w-full h-8 px-3 flex items-center justify-between bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ marginTop: index === 0 ? 0 : '17px' }}
                  >
                    <span className={filter.values.length > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-600'}>
                      {filter.values.length > 0 
                        ? `${filter.values.length} selected` 
                        : 'Select...'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {/* What Dropdown Menu with Checkboxes */}
                  {openDropdowns[filter.id] === 'values' && filter.field && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-[60] max-h-48 overflow-y-auto" ref={el => dropdownRefs.current[`${filter.id}-values`] = el}>
                      {filterOptions[filter.field]?.map((value) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filter.values.includes(value)}
                            onChange={() => handleValueToggle(filter.id, value)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className="capitalize">{value}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="w-6 h-6 flex items-center justify-center text-neutral-400 dark:text-neutral-600 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors flex-shrink-0"
                  style={{ marginTop: index === 0 ? '17px' : '17px' }}
                  title="Remove filter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              No filters added yet
            </p>
          </div>
        )}

        {/* Add More Button */}
        <button
          onClick={handleAddFilter}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Filter</span>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <button
          onClick={handleReset}
          className="h-8 px-3 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900 rounded-lg transition-colors"
        >
          Clear All
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="h-8 px-3 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="h-8 px-4 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}