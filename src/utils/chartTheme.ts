import type { Options } from 'highcharts';
import type { Theme } from '../hooks/useTheme';

// One colour palette for every chart, so a campaign looks the same everywhere.
export const CHART_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e', '#ec4899'];

/**
 * Highcharts does not read Tailwind classes, so dark mode colours are passed
 * as chart options. Each chart merges these base options with its own.
 */
export function getBaseChartOptions(theme: Theme): Options {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#a3a3a3' : '#737373'; // matches shadcn muted-foreground
  const gridColor = isDark ? '#2e2e2e' : '#e5e5e5'; // matches shadcn border

  return {
    colors: CHART_COLORS,
    chart: { backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { itemStyle: { color: textColor }, itemHoverStyle: { color: isDark ? '#ffffff' : '#000000' } },
    xAxis: {
      labels: { style: { color: textColor } },
      lineColor: gridColor,
      tickColor: gridColor,
    },
    yAxis: {
      title: { text: undefined },
      labels: { style: { color: textColor } },
      gridLineColor: gridColor,
    },
    tooltip: {
      backgroundColor: isDark ? '#262626' : '#ffffff',
      style: { color: textColor },
      borderColor: gridColor,
    },
  };
}
