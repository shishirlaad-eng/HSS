/**
 * REUSABLE STATUS FILTER COMPONENT
 * 
 * Icon button with dropdown menu to filter by status
 * Includes show/hide icon that toggles between eye/eye-off
 * 
 * SPECIFICATIONS:
 * - Button Size: 40×40px
 * - Icon Size: 20×20px
 * - Menu Width: 192px (w-48)
 * - Menu Position: right-0
 * - Z-index: 50
 * - Active state: Shows count badge
 * 
 * USAGE:
 * <StatusFilter
 *   currentStatus="all"
 *   statuses={[
 *     { value: 'all', label: 'All Items', count: 120 },
 *     { value: 'active', label: 'Active', count: 80 },
 *     { value: 'inactive', label: 'Inactive', count: 40 }
 *   ]}
 *   onChange={setFilterStatus}
 * />
 * 
 * PROPS:
 * - currentStatus: Currently selected status filter
 * - statuses: Array of status options with labels and counts
 * - onChange: Callback when status changes
 * - showIcon: Icon to use (default: Eye)
 */

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FlyoutMenu, FlyoutMenuItem } from './FlyoutMenu';

export interface StatusOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

interface StatusFilterProps {
  currentStatus: string;
  statuses: StatusOption[];
  onChange: (status: string) => void;
  className?: string;
  showActiveIcon?: boolean;
}

export function StatusFilter({
  currentStatus,
  statuses,
  onChange,
  className = '',
  showActiveIcon = true
}: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Safety check for statuses prop
  const safeStatuses = statuses || [];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusChange = (status: string) => {
    onChange(status);
    setIsOpen(false);
  };

  const isFiltered = currentStatus !== 'all';
  const Icon = isFiltered && showActiveIcon ? EyeOff : Eye;

  return (
    <div ref={containerRef} className={`relative ${className}`} data-flyout-container>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Filter by status"
        className={`
          w-10 h-10 
          flex items-center justify-center 
          bg-white dark:bg-neutral-950 
          border 
          ${isFiltered 
            ? 'border-primary-500 dark:border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-primary-300 dark:hover:border-primary-700'
          }
          rounded-lg 
          transition-all
          relative
        `.trim().replace(/\s+/g, ' ')}
      >
        <Icon className="w-5 h-5" />
        
        {/* Active filter indicator */}
        {isFiltered && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white dark:border-neutral-950" />
        )}
      </button>

      {isOpen && safeStatuses.length > 0 && (
        <FlyoutMenu position="right" width="w-48">
          {safeStatuses.map((status, index) => (
            <FlyoutMenuItem
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              roundedTop={index === 0}
              roundedBottom={index === safeStatuses.length - 1}
              className={currentStatus === status.value ? 'bg-neutral-50 dark:bg-neutral-900' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{status.label}</span>
                {status.count !== undefined && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                    {status.count}
                  </span>
                )}
              </div>
            </FlyoutMenuItem>
          ))}
        </FlyoutMenu>
      )}
    </div>
  );
}