/**
 * ADVANCED SEARCH PANEL - Reusable Component
 * 
 * A comprehensive, configurable advanced search/filter system that can be
 * used across different data types and projects. This component consolidates
 * the advanced search pattern used throughout the HB application.
 * 
 * ============================================================================
 * DESIGN GUIDELINES
 * ============================================================================
 * 
 * VISUAL SPECIFICATIONS:
 * - Panel Width: 480px fixed
 * - Max Height: 500px with vertical scroll
 * - Position: Absolute, right-aligned below trigger button
 * - Z-index: 40 (50+ for nested dropdowns)
 * - Border Radius: 8px (rounded-lg)
 * - Shadow: shadow-xl
 * 
 * STRUCTURE:
 * 1. Header Section (px-4 py-3)
 *    - Title on left
 *    - Close button (X) on right
 *    - Border bottom
 * 
 * 2. Content Section (p-4, max-h-[500px] overflow-y-auto)
 *    - Filter rows with "Where" and "What" dropdowns
 *    - "Add Filter" button (dashed border)
 *    - Empty state message when no filters
 * 
 * 3. Footer Section (px-4 py-3)
 *    - "Clear All" button on left
 *    - "Cancel" and "Apply" buttons on right
 *    - Border top
 *    - Background: neutral-50/neutral-900/50
 * 
 * COLOR SYSTEM (Dark Mode Support):
 * - Background: white / neutral-950
 * - Border: neutral-200 / neutral-800
 * - Text Primary: neutral-900 / white
 * - Text Secondary: neutral-600 / neutral-400
 * - Text Tertiary: neutral-500 / neutral-500
 * - Hover Background: neutral-50 / neutral-800
 * - Primary Color: primary-600 / primary-400
 * - Primary Hover: primary-700 / primary-500
 * 
 * INTERACTION PATTERNS:
 * - Click outside to close panel
 * - Each filter row has "Where" (field) and "What" (values) dropdowns
 * - "What" dropdown supports multi-select with checkboxes
 * - Remove button (X) for each filter row
 * - Add Filter button shows dashed border hover effect
 * - Clear All removes all filters
 * - Cancel closes without applying
 * - Apply closes and triggers callback
 * 
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 * 
 * BASIC USAGE:
 * ```tsx
 * import { AdvancedSearchPanel, type FilterCondition } from './components/hb/listing';
 * 
 * function MyPage() {
 *   const [showSearch, setShowSearch] = useState(false);
 *   const [filters, setFilters] = useState<FilterCondition[]>([]);
 * 
 *   const filterOptions = {
 *     'Job Status': ['Active', 'On Leave', 'Inactive'],
 *     'Department': ['Engineering', 'Sales', 'HR', 'Marketing'],
 *     'Location': ['Lagos', 'Abuja', 'Port Harcourt']
 *   };
 * 
 *   return (
 *     <div className="relative">
 *       <button onClick={() => setShowSearch(true)}>
 *         Advanced Search
 *       </button>
 *       
 *       <AdvancedSearchPanel
 *         isOpen={showSearch}
 *         onClose={() => setShowSearch(false)}
 *         filters={filters}
 *         onFiltersChange={setFilters}
 *         filterOptions={filterOptions}
 *       />
 *     </div>
 *   );
 * }
 * ```
 * 
 * WITH SEARCH BAR INTEGRATION:
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onAdvancedSearch={() => setShowSearch(true)}
 *   activeFilterCount={filters.filter(f => f.values.length > 0).length}
 * />
 * 
 * <AdvancedSearchPanel
 *   isOpen={showSearch}
 *   onClose={() => setShowSearch(false)}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   filterOptions={filterOptions}
 *   onApply={handleApplyFilters}
 * />
 * ```
 * 
 * WITH FILTER CHIPS:
 * ```tsx
 * <FilterChips
 *   filters={filters.filter(f => f.values.length > 0)}
 *   onRemove={(id) => setFilters(filters.filter(f => f.id !== id))}
 *   onClearAll={() => setFilters([])}
 * />
 * 
 * // Your data display here
 * ```
 * 
 * DYNAMIC FILTER OPTIONS FROM DATA:
 * ```tsx
 * const filterOptions = {
 *   'Status': Array.from(new Set(employees.map(e => e.status))),
 *   'Department': Array.from(new Set(employees.map(e => e.department))).sort(),
 *   'Location': Array.from(new Set(employees.map(e => e.location))).sort(),
 * };
 * ```
 * 
 * FILTERING DATA WITH RESULTS:
 * ```tsx
 * const filteredData = data.filter(item => {
 *   // Apply search query first
 *   if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
 *     return false;
 *   }
 * 
 *   // Apply advanced filters
 *   for (const condition of filters) {
 *     if (condition.values.length === 0) continue;
 * 
 *     let fieldValue: string = '';
 *     
 *     // Map filter field to data property
 *     switch (condition.field) {
 *       case 'Job Status':
 *         fieldValue = item.status;
 *         break;
 *       case 'Department':
 *         fieldValue = item.department;
 *         break;
 *       case 'Location':
 *         fieldValue = item.location;
 *         break;
 *       default:
 *         continue;
 *     }
 * 
 *     // Check if item matches any selected values
 *     if (!condition.values.includes(fieldValue)) {
 *       return false;
 *     }
 *   }
 * 
 *   return true;
 * });
 * ```
 * 
 * WITH DEFAULT FILTERS:
 * ```tsx
 * // Set default filter on component mount
 * const [filters, setFilters] = useState<FilterCondition[]>([
 *   {
 *     id: 'default-active',
 *     field: 'Job Status',
 *     values: ['Active']
 *   }
 * ]);
 * ```
 * 
 * CUSTOM TITLE:
 * ```tsx
 * <AdvancedSearchPanel
 *   title="Advanced Filters"
 *   // ... other props
 * />
 * ```
 * 
 * ============================================================================
 * INTEGRATION WITH OTHER COMPONENTS
 * ============================================================================
 * 
 * This component is designed to work seamlessly with:
 * - SearchBar: Trigger advanced search and show active filter count
 * - FilterChips: Display and manage active filters
 * - PageHeader: Integrate into page header toolbar
 * - Pagination: Reset to page 1 when filters change
 * 
 * COMPLETE PAGE EXAMPLE:
 * ```tsx
 * export function EmployeeDirectory() {
 *   const [viewMode, setViewMode] = useState<ViewMode>('grid');
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const [showSearch, setShowSearch] = useState(false);
 *   const [filters, setFilters] = useState<FilterCondition[]>([]);
 *   const [currentPage, setCurrentPage] = useState(1);
 * 
 *   const filterOptions = {
 *     'Job Status': ['Active', 'On Leave', 'Inactive'],
 *     'Department': Array.from(new Set(employees.map(e => e.department))).sort(),
 *     'Location': Array.from(new Set(employees.map(e => e.location))).sort(),
 *   };
 * 
 *   // Reset to page 1 when filters change
 *   useEffect(() => {
 *     setCurrentPage(1);
 *   }, [searchQuery, filters]);
 * 
 *   return (
 *     <div>
 *       <PageHeader
 *         title="Employee Directory"
 *         icon={Users}
 *         actions={[
 *           <SearchBar
 *             value={searchQuery}
 *             onChange={setSearchQuery}
 *             onAdvancedSearch={() => setShowSearch(true)}
 *             activeFilterCount={filters.filter(f => f.values.length > 0).length}
 *           />,
 *           <ViewModeSwitcher value={viewMode} onChange={setViewMode} />,
 *           // ... other actions
 *         ]}
 *       />
 * 
 *       <AdvancedSearchPanel
 *         isOpen={showSearch}
 *         onClose={() => setShowSearch(false)}
 *         filters={filters}
 *         onFiltersChange={setFilters}
 *         filterOptions={filterOptions}
 *       />
 * 
 *       <FilterChips
 *         filters={filters.filter(f => f.values.length > 0)}
 *         onRemove={(id) => setFilters(filters.filter(f => f.id !== id))}
 *         onClearAll={() => setFilters([])}
 *       />
 * 
 *       // Your data display here
 *     </div>
 *   );
 * }
 * ```
 * 
 * ============================================================================
 * PROPS REFERENCE
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronDown, Check } from 'lucide-react';

/**
 * Filter condition structure
 * @property id - Unique identifier for the filter
 * @property field - The field name to filter on (e.g., "Job Status", "Department")
 * @property values - Array of selected values for this field
 */
export interface FilterCondition {
  id: string;
  field: string;
  values: string[];
}

/**
 * Advanced Search Panel Props
 */
export interface AdvancedSearchPanelProps {
  /** Controls panel visibility */
  isOpen: boolean;
  
  /** Callback when panel should close */
  onClose: () => void;
  
  /** Current filter conditions */
  filters: FilterCondition[];
  
  /** Callback when filters change */
  onFiltersChange: (filters: FilterCondition[]) => void;
  
  /** Available filter options: { "Field Name": ["option1", "option2"] } */
  filterOptions: Record<string, string[]>;
  
  /** Optional callback when Apply is clicked */
  onApply?: () => void;
  
  /** Optional custom title (default: "Filter By") */
  title?: string;
}

/**
 * Advanced Search Panel Component
 * 
 * A reusable multi-filter panel with "Where" and "What" dropdowns,
 * supporting multiple simultaneous filters with multi-select values.
 */
export function AdvancedSearchPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  filterOptions,
  onApply,
  title = 'Filter By'
}: AdvancedSearchPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterCondition[]>(filters);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, 'field' | 'values' | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync local filters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Close panel when clicking outside
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

  /**
   * Add a new empty filter row
   */
  const handleAddFilter = () => {
    const firstField = Object.keys(filterOptions)[0] || '';
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: firstField,
      values: []
    };
    setLocalFilters([...localFilters, newFilter]);
  };

  /**
   * Remove a filter row
   */
  const handleRemoveFilter = (id: string) => {
    setLocalFilters(localFilters.filter(f => f.id !== id));
  };

  /**
   * Change the field (Where) of a filter
   */
  const handleFieldChange = (id: string, field: string) => {
    setLocalFilters(localFilters.map(f => 
      f.id === id ? { ...f, field, values: [] } : f
    ));
    setOpenDropdowns({ ...openDropdowns, [id]: null });
  };

  /**
   * Toggle a value in the multi-select (What) dropdown
   */
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

  /**
   * Apply filters and close panel
   */
  const handleApply = () => {
    // Filter out empty filters (no values selected)
    const validFilters = localFilters.filter(f => f.field && f.values.length > 0);
    onFiltersChange(validFilters);
    if (onApply) onApply();
    onClose();
  };

  /**
   * Clear all filters
   */
  const handleReset = () => {
    setLocalFilters([]);
  };

  /**
   * Toggle dropdown visibility for a filter row
   */
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
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="p-4 overflow-visible">
        
        {/* Filter Rows */}
        {localFilters.length > 0 ? (
          <div className="space-y-2 mb-3">
            {localFilters.map((filter, index) => (
              <div key={filter.id} className="flex items-start gap-2">
                
                {/* WHERE DROPDOWN - Field Selection */}
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
                    <div 
                      ref={el => dropdownRefs.current[`${filter.id}-field`] = el} 
                      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto"
                    >
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

                {/* WHAT DROPDOWN - Multi-select Values */}
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
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-[60] max-h-48 overflow-y-auto" 
                      ref={el => dropdownRefs.current[`${filter.id}-values`] = el}
                    >
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

                {/* REMOVE BUTTON */}
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="w-6 h-6 flex items-center justify-center text-neutral-400 dark:text-neutral-600 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors flex-shrink-0"
                  style={{ marginTop: index === 0 ? '17px' : '17px' }}
                  title="Remove filter"
                  aria-label="Remove filter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              No filters added yet
            </p>
          </div>
        )}

        {/* ADD FILTER BUTTON */}
        <button
          onClick={handleAddFilter}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Filter</span>
        </button>
      </div>

      {/* ==================== FOOTER ==================== */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        {/* Clear All Button */}
        <button
          onClick={handleReset}
          className="h-8 px-3 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900 rounded-lg transition-colors"
        >
          Clear All
        </button>
        
        {/* Action Buttons */}
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