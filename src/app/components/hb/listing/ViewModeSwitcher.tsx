/**
 * REUSABLE VIEW MODE SWITCHER COMPONENT
 * 
 * Icon button with dropdown menu to switch between different view modes
 * 
 * SPECIFICATIONS:
 * - Button Size: 40×40px
 * - Icon Size: 20×20px
 * - Menu Width: 160px (w-40)
 * - Menu Position: right-0
 * - Z-index: 50
 * 
 * USAGE:
 * <ViewModeSwitcher
 *   currentMode="grid"
 *   modes={['grid', 'list', 'table']}
 *   onChange={setViewMode}
 * />
 * 
 * PROPS:
 * - currentMode: Currently active view mode
 * - modes: Array of available view modes (default: all 3)
 * - onChange: Callback when mode changes
 * - labels: Custom labels for modes (optional)
 */

import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, List, Table2, History, ChevronDown } from 'lucide-react';
import { FlyoutMenu, FlyoutMenuItem } from './FlyoutMenu';

type ViewMode = 'grid' | 'list' | 'table' | 'timeline';

interface ViewModeSwitcherProps {
  value?: ViewMode;
  currentMode?: ViewMode;
  modes?: ViewMode[];
  onChange: (mode: ViewMode) => void;
  labels?: Partial<Record<ViewMode, string>>;
  className?: string;
}

const defaultModes: ViewMode[] = ['grid', 'list', 'table'];

const defaultLabels: Record<ViewMode, string> = {
  grid: 'Grid View',
  list: 'List View',
  table: 'Table View',
  timeline: 'Timeline View',
};

const iconMap: Record<ViewMode, typeof LayoutGrid> = {
  grid: LayoutGrid,
  list: List,
  table: Table2,
  timeline: History,
};

export function ViewModeSwitcher({
  value,
  currentMode,
  modes = defaultModes,
  onChange,
  labels = {},
  className = ''
}: ViewModeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const CurrentIcon = iconMap[currentMode || value || 'grid'];
  const mergedLabels = { ...defaultLabels, ...labels };

  const handleModeChange = (mode: ViewMode) => {
    onChange(mode);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} data-flyout-container>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change view mode"
        className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg transition-all"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <FlyoutMenu position="right" width="w-40">
          {modes.map((mode, index) => {
            const Icon = iconMap[mode];
            return (
              <FlyoutMenuItem
                key={mode}
                icon={Icon}
                onClick={() => handleModeChange(mode)}
                roundedTop={index === 0}
                roundedBottom={index === modes.length - 1}
              >
                {mergedLabels[mode]}
              </FlyoutMenuItem>
            );
          })}
        </FlyoutMenu>
      )}
    </div>
  );
}

export type { ViewMode };