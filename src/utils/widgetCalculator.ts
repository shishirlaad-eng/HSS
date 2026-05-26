/**
 * GENERIC WIDGET CALCULATOR UTILITY
 * 
 * Calculates values for dashboard widgets based on any data type
 * Fully generic and reusable across different modules
 */

import type { WidgetConfig } from "../types/widgets";

/**
 * Generic data item interface
 * Your data can have any properties, but these are commonly used
 */
export interface GenericDataItem {
  id?: string;
  status?: string;
  [key: string]: any; // Allow any additional properties
}

/**
 * Calculate widget value from data array
 * @param widget - Widget configuration with calculation logic
 * @param data - Array of data items to calculate from
 * @returns Calculated value (number or string)
 */
export function calculateWidgetValue(
  widget: WidgetConfig,
  data: GenericDataItem[]
): number | string {
  // If widget has custom formula, use it
  if (widget.formula) {
    return calculateCustomFormula(widget, data);
  }

  // Default predefined calculations by widget ID
  // These are common patterns that can be overridden by custom formulas
  switch (widget.id) {
    case "total":
    case "total-items":
      return data.length;
      
    case "active":
    case "active-items":
      return data.filter(item => item.status === 'active').length;
      
    case "inactive":
    case "inactive-items":
      return data.filter(item => item.status === 'inactive').length;
      
    default:
      // If no predefined calculation and no formula, return count
      return data.length;
  }
}

/**
 * Calculate value using custom formula
 * @param widget - Widget configuration with formula
 * @param data - Data array
 * @returns Calculated result
 */
function calculateCustomFormula(
  widget: WidgetConfig,
  data: GenericDataItem[]
): number {
  if (!widget.formula) return 0;
  
  // Filter data based on condition
  let filteredData = data;
  if (widget.formula.condition) {
    filteredData = filterByCondition(data, widget.formula.condition);
  }
  
  // Apply calculation type
  switch (widget.formula.type) {
    case "count":
      return filteredData.length;
      
    case "sum":
      if (widget.formula.field) {
        return filteredData.reduce((sum, item) => {
          const value = item[widget.formula!.field!];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
      }
      return filteredData.length;
      
    case "average":
      if (filteredData.length === 0) return 0;
      if (widget.formula.field) {
        const total = filteredData.reduce((sum, item) => {
          const value = item[widget.formula!.field!];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
        return Math.round(total / filteredData.length);
      }
      return 0;
      
    case "percentage":
      if (data.length === 0) return 0;
      return Math.round((filteredData.length / data.length) * 100);
      
    case "unique":
      if (widget.formula.field) {
        const uniqueValues = new Set(
          filteredData.map(item => item[widget.formula!.field!])
        );
        return uniqueValues.size;
      }
      return 0;
      
    default:
      return filteredData.length;
  }
}

/**
 * Filter data array by condition string
 * Supports simple conditions: field = value, field != value
 * Multiple conditions can be joined with AND
 * 
 * @example
 * "status = active"
 * "status = active AND type = premium"
 * "count > 10"
 * 
 * @param data - Data array to filter
 * @param condition - Condition string
 * @returns Filtered data array
 */
function filterByCondition(
  data: GenericDataItem[], 
  condition: string
): GenericDataItem[] {
  // Parse multiple conditions separated by AND
  const conditions = condition.split(' AND ').map(c => c.trim());
  
  return data.filter(item => {
    return conditions.every(cond => {
      // Parse condition: "field operator value"
      const equalMatch = cond.match(/(.+?)\s*=\s*(.+)/);
      const notEqualMatch = cond.match(/(.+?)\s*!=\s*(.+)/);
      const greaterMatch = cond.match(/(.+?)\s*>\s*(.+)/);
      const lessMatch = cond.match(/(.+?)\s*<\s*(.+)/);
      
      if (equalMatch) {
        const [, field, value] = equalMatch;
        const cleanValue = value.trim().replace(/^['"]|['"]$/g, '');
        const itemValue = item[field.trim()];
        
        // Handle different types
        if (typeof itemValue === 'number') {
          return itemValue === Number(cleanValue);
        }
        return String(itemValue).toLowerCase() === cleanValue.toLowerCase();
      }
      
      if (notEqualMatch) {
        const [, field, value] = notEqualMatch;
        const cleanValue = value.trim().replace(/^['"]|['"]$/g, '');
        const itemValue = item[field.trim()];
        
        if (typeof itemValue === 'number') {
          return itemValue !== Number(cleanValue);
        }
        return String(itemValue).toLowerCase() !== cleanValue.toLowerCase();
      }
      
      if (greaterMatch) {
        const [, field, value] = greaterMatch;
        const itemValue = Number(item[field.trim()]);
        return !isNaN(itemValue) && itemValue > Number(value.trim());
      }
      
      if (lessMatch) {
        const [, field, value] = lessMatch;
        const itemValue = Number(item[field.trim()]);
        return !isNaN(itemValue) && itemValue < Number(value.trim());
      }
      
      return true;
    });
  });
}

/**
 * Get widget color configuration
 * @param widget - Widget configuration
 * @returns Object with background and text color classes
 */
export function getWidgetColor(widget: WidgetConfig): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
  };
  
  return colorMap[widget.color || 'indigo'] || colorMap.indigo;
}