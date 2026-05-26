/**
 * Widget Configuration Types
 * Used for dashboard summary widgets
 */

export interface WidgetConfig {
  id: string;
  label: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  color?: string;
  enabled: boolean;
  formula?: {
    type: 'count' | 'sum' | 'average' | 'percentage' | 'unique';
    field?: string;
    condition?: string;
  };
  trend?: number;
  trendDirection?: 'up' | 'down';
}
