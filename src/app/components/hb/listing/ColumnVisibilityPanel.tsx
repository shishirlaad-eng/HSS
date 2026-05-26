import React, { useRef, useEffect } from 'react';
import { Check, Columns3, X } from 'lucide-react';
import { cn } from '../../ui/utils';

export interface ColumnConfig {
  key: string;
  label: string;
}

interface ColumnVisibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (key: string) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export function ColumnVisibilityPanel({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn,
  anchorRef
}: ColumnVisibilityPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className={cn(
        "absolute top-full right-0 mt-2 w-64 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      )}
    >
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Columns3 className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Columns
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {columns.map((column) => (
            <label
              key={column.key}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group",
                visibleColumns[column.key] 
                  ? "bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300" 
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              )}
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={visibleColumns[column.key]}
                  onChange={() => onToggleColumn(column.key)}
                  className="peer appearance-none w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-700 checked:border-primary-600 dark:checked:border-primary-500 checked:bg-primary-600 dark:checked:bg-primary-500 transition-all cursor-pointer"
                />
                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm font-medium tracking-tight">
                {column.label}
              </span>
              {visibleColumns[column.key] && (
                <div className="ml-auto w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-900 flex justify-between items-center">
        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
          {Object.values(visibleColumns).filter(Boolean).length} of {columns.length} Active
        </span>
        <button 
          onClick={() => {
            const allVisible = columns.every(c => visibleColumns[c.key]);
            columns.forEach(c => {
              if (allVisible !== visibleColumns[c.key]) {
                // This is a simplified approach, in real usage we'd batch this
              }
            });
          }}
          className="text-[10px] text-primary-600 dark:text-primary-400 hover:underline font-bold uppercase tracking-wider"
        >
          {/* Reset button logic could go here */}
        </button>
      </div>
    </div>
  );
}
