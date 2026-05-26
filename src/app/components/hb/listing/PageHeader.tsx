/**
 * REUSABLE PAGE HEADER COMPONENT
 * 
 * Standard page header with title, breadcrumb, and standardized More Menu
 * 
 * SPECIFICATIONS:
 * 
 * TITLE:
 * - Font Size: 32px (text-[32px])
 * - Line Height: 40px (leading-[40px])
 * - Font Weight: 600 (font-semibold)
 * - Color: neutral-900 (dark: white)
 * - Margin Bottom: 4px (mb-1)
 * 
 * CONTAINER:
 * - Margin Bottom: 24px (mb-6)
 * - Display: flex items-center justify-between
 * - Gap: 16px (gap-4) on mobile, responsive
 * 
 * MORE OPTIONS MENU:
 * - Standardized pattern with Import, Export, Print, Sort, Customize Columns
 * - Hover-based submenus for Export, Sort, and Customize Columns
 * - Full dark mode support
 * - Consistent styling across all modules
 * 
 * USAGE:
 * <PageHeader
 *   title="Locations"
 *   breadcrumbs={[
 *     { label: 'Home', href: '#' },
 *     { label: 'Organisational Master', href: '#' },
 *     { label: 'Locations', current: true }
 *   ]}
 *   // Optional More Menu configuration
 *   moreMenu={{
 *     onImport: () => console.log('Import'),
 *     exportOptions: {
 *       onExportCSV: () => console.log('Export CSV'),
 *       onExportExcel: () => console.log('Export Excel'),
 *       onExportPDF: () => console.log('Export PDF'),
 *     },
 *     onPrint: () => window.print(),
 *     sortOptions: [
 *       { value: "name", label: "Name (A-Z)", direction: "asc" },
 *       { value: "name", label: "Name (Z-A)", direction: "desc" },
 *     ],
 *     sortField: "name",
 *     sortDirection: "asc",
 *     onSortChange: (field, direction) => {},
 *     customizeColumns: {
 *       columns: [
 *         { key: 'name', label: 'Location Name' },
 *         { key: 'type', label: 'Type' },
 *       ],
 *       visibleColumns: { name: true, type: true },
 *       onToggleColumn: (key) => {},
 *     }
 *   }}
 * >
 *   <SearchBar ... />
 *   <PrimaryButton icon={Plus}>Add Location</PrimaryButton>
 *   <IconButton ... />
 * </PageHeader>
 */

import { useState } from 'react';
import {
  MoreVertical,
  Upload,
  Download,
  Printer,
  ArrowUpDown,
  Columns3,
  ChevronRight,
  Check,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { IconButton } from './IconButton';
import { FlyoutMenu, FlyoutMenuItem, FlyoutMenuDivider } from './FlyoutMenu';
import { cn } from '../../ui/utils';

interface BreadcrumbConfig {
  label: string;
  href?: string;
  current?: boolean;
  onClick?: () => void;
}

export interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface ColumnConfig {
  key: string;
  label: string;
}

export interface MoreMenuConfig {
  // Import
  onImport?: () => void;
  
  // Export submenu
  exportOptions?: {
    onExportCSV?: () => void;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
  };
  
  // Print
  onPrint?: () => void;
  
  // Sort submenu
  sortOptions?: SortOption[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  
  // Customize Columns submenu
  customizeColumns?: {
    columns: ColumnConfig[];
    visibleColumns: Record<string, boolean>;
    onToggleColumn: (key: string) => void;
  };
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbConfig[];
  children?: React.ReactNode;
  className?: string;
  moreMenu?: MoreMenuConfig;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  children,
  className = '',
  moreMenu,
}: PageHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Check if More Menu should be shown
  const hasMoreMenu = moreMenu && (
    moreMenu.onImport ||
    moreMenu.exportOptions ||
    moreMenu.onPrint ||
    moreMenu.sortOptions ||
    moreMenu.customizeColumns
  );

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-[24px] mt-[0px] mr-[0px] ml-[0px]">
        <div>
          <h2 className="text-[32px] leading-[40px] font-semibold text-neutral-900 dark:text-white mb-1">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}

          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb>
              {breadcrumbs.map((item, index) => (
                <BreadcrumbItem
                  key={index}
                  href={item.href}
                  current={item.current}
                  onClick={item.onClick}
                >
                  {item.label}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
        </div>

        {(children || hasMoreMenu) && (
          <div className="flex items-center gap-2">
            {children}
            
            {hasMoreMenu && (
              <div className="relative" data-flyout-container>
                <IconButton
                  icon={MoreVertical}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  title="More options"
                />

                {showMoreMenu && (
                  <FlyoutMenu position="right" onClose={() => setShowMoreMenu(false)}>
                    {/* Import */}
                    {moreMenu.onImport && (
                      <FlyoutMenuItem
                        icon={Upload}
                        onClick={() => {
                          moreMenu.onImport?.();
                          setShowMoreMenu(false);
                        }}
                        roundedTop
                      >
                        Import
                      </FlyoutMenuItem>
                    )}

                    {/* Export with submenu */}
                    {moreMenu.exportOptions && (
                      <FlyoutMenuItem icon={Download} asDiv>
                        <div className="relative group/export w-full">
                          <div className="flex items-center justify-between w-full">
                            <span>Export</span>
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          </div>

                          {/* Export Submenu */}
                          <div className="absolute left-full top-0 ml-1 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all duration-200 pointer-events-none group-hover/export:pointer-events-auto">
                            {moreMenu.exportOptions.onExportCSV && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moreMenu.exportOptions?.onExportCSV?.();
                                  toast.success('Exporting as CSV...');
                                  setShowMoreMenu(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 rounded-t-lg"
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                                CSV
                              </button>
                            )}
                            {moreMenu.exportOptions.onExportExcel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moreMenu.exportOptions?.onExportExcel?.();
                                  toast.success('Exporting as Excel...');
                                  setShowMoreMenu(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                                Excel
                              </button>
                            )}
                            {moreMenu.exportOptions.onExportPDF && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moreMenu.exportOptions?.onExportPDF?.();
                                  toast.success('Exporting as PDF...');
                                  setShowMoreMenu(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 rounded-b-lg"
                              >
                                <FileText className="w-4 h-4" />
                                PDF
                              </button>
                            )}
                          </div>
                        </div>
                      </FlyoutMenuItem>
                    )}

                    {/* Print */}
                    {moreMenu.onPrint && (
                      <FlyoutMenuItem
                        icon={Printer}
                        onClick={() => {
                          moreMenu.onPrint?.();
                          setShowMoreMenu(false);
                        }}
                      >
                        Print
                      </FlyoutMenuItem>
                    )}

                    {/* Divider before Sort and Customize */}
                    {(moreMenu.sortOptions || moreMenu.customizeColumns) && (
                      <FlyoutMenuDivider />
                    )}

                    {/* Sort with submenu */}
                    {moreMenu.sortOptions && moreMenu.sortOptions.length > 0 && (
                      <FlyoutMenuItem icon={ArrowUpDown} asDiv>
                        <div className="relative group/sort w-full">
                          <div className="flex items-center justify-between w-full">
                            <span>Sort</span>
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          </div>

                          {/* Sort Submenu */}
                          <div className="absolute left-full top-0 ml-1 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1.5 z-50 opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all duration-200 pointer-events-none group-hover/sort:pointer-events-auto">
                            <div className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 mb-1">
                              Sort By
                            </div>
                            {moreMenu.sortOptions.map((option, index) => (
                              <button
                                key={`${option.value}-${option.direction}-${index}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moreMenu.onSortChange?.(option.value, option.direction);
                                  setShowMoreMenu(false);
                                  toast.success(`Sorted by ${option.label}`);
                                }}
                                className={cn(
                                  'w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors',
                                  moreMenu.sortField === option.value &&
                                    moreMenu.sortDirection === option.direction
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20'
                                    : 'text-neutral-700 dark:text-neutral-300'
                                )}
                              >
                                <span>{option.label}</span>
                                {moreMenu.sortField === option.value &&
                                  moreMenu.sortDirection === option.direction && (
                                    <Check className="w-4 h-4" />
                                  )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </FlyoutMenuItem>
                    )}

                    {/* Customize Columns with submenu */}
                    {moreMenu.customizeColumns && (
                      <FlyoutMenuItem
                        icon={Columns3}
                        asDiv
                        roundedBottom
                      >
                        <div className="relative group/columns w-full">
                          <div className="flex items-center justify-between w-full">
                            <span>Customize Columns</span>
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          </div>

                          {/* Customize Columns Submenu */}
                          <div className="absolute left-full top-0 ml-1 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1.5 z-50 opacity-0 invisible group-hover/columns:opacity-100 group-hover/columns:visible transition-all duration-200 pointer-events-none group-hover/columns:pointer-events-auto">
                            <div className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 mb-1">
                              Table Columns
                            </div>
                            {moreMenu.customizeColumns.columns.map((column) => (
                              <label
                                key={column.key}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={moreMenu.customizeColumns?.visibleColumns[column.key]}
                                  onChange={() =>
                                    moreMenu.customizeColumns?.onToggleColumn(column.key)
                                  }
                                  className="w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                                />
                                <span>{column.label}</span>
                                {moreMenu.customizeColumns?.visibleColumns[column.key] && (
                                  <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 ml-auto" />
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      </FlyoutMenuItem>
                    )}
                  </FlyoutMenu>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}