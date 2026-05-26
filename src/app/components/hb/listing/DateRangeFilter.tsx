/**
 * DATE RANGE FILTER COMPONENT
 * 
 * Dropdown for selecting date ranges with presets and custom date selection
 * Positioned below trigger button, follows FilterPopup design pattern
 * 
 * SPECIFICATIONS:
 * - Dropdown Width: 320px
 * - Position: Below trigger (right-aligned)
 * - Z-index: 40
 * - Includes preset ranges and custom date inputs
 * 
 * USAGE:
 * <DateRangeFilter
 *   isOpen={showDateRange}
 *   onClose={() => setShowDateRange(false)}
 *   startDate={startDate}
 *   endDate={endDate}
 *   onApply={(start, end) => { ... }}
 * />
 */

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Check } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
  label?: string;
}

interface DateRangeFilterProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
  onApply: (startDate: string, endDate: string, label?: string) => void;
  title?: string;
}

// Preset date ranges
const getPresetRanges = (): DateRange[] => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Today
  const todayRange: DateRange = {
    startDate: formatDate(today),
    endDate: formatDate(today),
    label: 'Today'
  };

  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayRange: DateRange = {
    startDate: formatDate(yesterday),
    endDate: formatDate(yesterday),
    label: 'Yesterday'
  };

  // Last 7 days
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 6);
  const last7DaysRange: DateRange = {
    startDate: formatDate(last7Days),
    endDate: formatDate(today),
    label: 'Last 7 Days'
  };

  // Last 30 days
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 29);
  const last30DaysRange: DateRange = {
    startDate: formatDate(last30Days),
    endDate: formatDate(today),
    label: 'Last 30 Days'
  };

  // This month
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthRange: DateRange = {
    startDate: formatDate(thisMonthStart),
    endDate: formatDate(today),
    label: 'This Month'
  };

  // Last month
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthRange: DateRange = {
    startDate: formatDate(lastMonthStart),
    endDate: formatDate(lastMonthEnd),
    label: 'Last Month'
  };

  return [
    todayRange,
    yesterdayRange,
    last7DaysRange,
    last30DaysRange,
    thisMonthRange,
    lastMonthRange
  ];
};

export function DateRangeFilter({
  isOpen,
  onClose,
  startDate = '',
  endDate = '',
  onApply,
  title = 'Select Date Range'
}: DateRangeFilterProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const presetRanges = getPresetRanges();

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

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

  if (!isOpen) return null;

  const handlePresetClick = (range: DateRange) => {
    setLocalStartDate(range.startDate);
    setLocalEndDate(range.endDate);
    setSelectedPreset(range.label || null);
  };

  const handleApply = () => {
    if (localStartDate && localEndDate) {
      onApply(localStartDate, localEndDate, selectedPreset || undefined);
      onClose();
    }
  };

  const handleClear = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setSelectedPreset(null);
    onApply('', '');
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[320px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <h3 className="font-sans text-neutral-900 dark:text-white">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Preset Ranges */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
            Quick Select
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presetRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handlePresetClick(range)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                  selectedPreset === range.label
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Inputs */}
        <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <label className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Custom Range
          </label>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={localStartDate}
                onChange={(e) => {
                  setLocalStartDate(e.target.value);
                  setSelectedPreset(null);
                }}
                className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={localEndDate}
                onChange={(e) => {
                  setLocalEndDate(e.target.value);
                  setSelectedPreset(null);
                }}
                min={localStartDate}
                className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handleClear}
          className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          Clear
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!localStartDate || !localEndDate}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
