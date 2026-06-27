import { 
  Building2, 
  Users, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  Briefcase, 
  BarChart3, 
  PieChart, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { type WidgetConfig } from "../../../../types/widgets";
import { calculateWidgetValue, getWidgetColor, type GenericDataItem } from "../../../../utils/widgetCalculator";

interface SimpleWidget {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: string;
  subtitle?: string;
  color?: string;
}

interface SummaryWidgetsProps {
  widgets: (WidgetConfig | SimpleWidget)[];
  data?: GenericDataItem[]; // Optional: only needed for WidgetConfig with formulas
  onManageWidgets?: () => void;
  title?: string;
  className?: string;
  colorCards?: boolean;
  centered?: boolean;
}

const CARD_COLOR_MAP: Record<string, { cardBg: string; valueCls: string; iconBg: string; iconText: string }> = {
  slate:   { cardBg: 'bg-slate-50 dark:bg-slate-900/40',     valueCls: 'text-slate-700 dark:text-slate-200',   iconBg: 'bg-slate-200 dark:bg-slate-700',    iconText: 'text-slate-600 dark:text-slate-300' },
  emerald: { cardBg: 'bg-emerald-50 dark:bg-emerald-900/20', valueCls: 'text-emerald-700 dark:text-emerald-300', iconBg: 'bg-emerald-200 dark:bg-emerald-800', iconText: 'text-emerald-600 dark:text-emerald-400' },
  amber:   { cardBg: 'bg-amber-50 dark:bg-amber-900/20',     valueCls: 'text-amber-700 dark:text-amber-300',   iconBg: 'bg-amber-200 dark:bg-amber-800',    iconText: 'text-amber-600 dark:text-amber-400' },
  sky:     { cardBg: 'bg-sky-50 dark:bg-sky-950/30',         valueCls: 'text-sky-700 dark:text-sky-300',       iconBg: 'bg-sky-200 dark:bg-sky-800',        iconText: 'text-sky-600 dark:text-sky-400' },
};

// Type guard to check if widget is a WidgetConfig
function isWidgetConfig(widget: WidgetConfig | SimpleWidget): widget is WidgetConfig {
  return 'id' in widget && 'enabled' in widget;
}

export function SummaryWidgets({
  widgets,
  data = [],
  onManageWidgets,
  title = "Summary",
  className = "",
  colorCards = false,
  centered = false,
}: SummaryWidgetsProps) {
  // Filter enabled widgets (for WidgetConfig) or show all (for SimpleWidget)
  const enabledWidgets = widgets.filter(w => isWidgetConfig(w) ? w.enabled : true);

  if (enabledWidgets.length === 0 && !onManageWidgets) {
    return null;
  }

  return (
    <div className={`mb-6 animate-in fade-in slide-in-from-top-4 duration-300 ${className}`}>
      {/* Header with Manage Widgets button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {onManageWidgets && (
          <button
            onClick={onManageWidgets}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Manage Widgets
          </button>
        )}
      </div>
      
      {/* Widgets Grid */}
      <div className={centered ? "grid grid-cols-1 sm:grid-cols-3 gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}>
        {enabledWidgets.map((widget) => {
          const Icon = widget.icon ? (
            {
              'Building2': Building2,
              'Users': Users,
              'MapPin': MapPin,
              'TrendingUp': TrendingUp,
              'TrendingDown': TrendingDown,
              'Activity': Activity,
              'Globe': Globe,
              'Briefcase': Briefcase,
              'BarChart3': BarChart3,
              'PieChart': PieChart,
              'CheckCircle': CheckCircle,
              'XCircle': XCircle,
              'Clock': Clock,
            }[widget.icon] || TrendingUp
          ) : TrendingUp;
          
          const colorConfig = getWidgetColor(widget);
          // Cast data to any to bypass strict type check in calculateWidgetValue which expects Location[]
          // In a real app, we'd make calculateWidgetValue generic
          const value = isWidgetConfig(widget) ? calculateWidgetValue(widget, data) : widget.value;
          
          const widgetColor = !isWidgetConfig(widget) ? (widget.color ?? 'slate') : (widget.color ?? 'indigo');
          const cardColors = CARD_COLOR_MAP[widgetColor] ?? CARD_COLOR_MAP['slate'];

          if (colorCards) {
            return (
              <div
                key={isWidgetConfig(widget) ? widget.id : widget.label}
                className={`${cardColors.cardBg} p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col items-center gap-3`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cardColors.iconBg}`}>
                  <Icon className={`w-5 h-5 ${cardColors.iconText}`} />
                </div>
                <div className={`text-3xl font-bold ${cardColors.valueCls}`}>
                  {value}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>
                    {widget.label}
                  </div>
                  {(widget.subtitle || (isWidgetConfig(widget) ? widget.description : undefined)) && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {widget.subtitle || (isWidgetConfig(widget) ? widget.description : undefined)}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={isWidgetConfig(widget) ? widget.id : widget.label}
              className="bg-white dark:bg-neutral-950 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col gap-2"
            >
              {/* Top row: Count on left, Icon on right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {value}
                  </div>
                  {widget.trend !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-3 h-3 ${widget.trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400 rotate-180'}`} />
                      <span className={`text-xs font-medium ${widget.trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {widget.trend}%
                      </span>
                    </div>
                  )}
                </div>

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorConfig.bg}`}>
                  <Icon className={`w-5 h-5 ${colorConfig.text}`} />
                </div>
              </div>

              {/* Bottom: Label and subtitle */}
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {widget.label}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {widget.subtitle || (isWidgetConfig(widget) ? widget.description : undefined)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}