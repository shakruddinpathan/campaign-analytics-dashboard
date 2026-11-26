import { memo, useMemo } from 'react';
import Highcharts from './highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import type { Theme } from '../../hooks/useTheme';
import { getBaseChartOptions } from '../../utils/chartTheme';
import { formatCompact, formatCurrency, formatDate } from '../../utils/format';

interface RevenueLineChartProps {
  daily: { date: string; revenue: number }[];
  movingAverage: (number | null)[];
  theme: Theme;
}

/** Daily revenue + 7-day moving average (sliding window) as a second line. */
function RevenueLineChart({ daily, movingAverage, theme }: RevenueLineChartProps) {
  // Rebuild options only when data or theme change — Highcharts redraws
  // whenever it receives a new options object.
  const options = useMemo<Highcharts.Options>(() => {
    const base = getBaseChartOptions(theme);
    return {
      ...base,
      chart: { ...base.chart, type: 'line', height: 320 },
      xAxis: {
        ...(base.xAxis as Highcharts.XAxisOptions),
        categories: daily.map((d) => formatDate(d.date)),
        tickInterval: Math.max(1, Math.ceil(daily.length / 8)), // ~8 labels, never crowded
      },
      yAxis: {
        ...(base.yAxis as Highcharts.YAxisOptions),
        labels: {
          ...(base.yAxis as Highcharts.YAxisOptions).labels,
          formatter() {
            return `₹${formatCompact(Number(this.value))}`;
          },
        },
      },
      tooltip: {
        ...base.tooltip,
        shared: true,
        pointFormatter() {
          return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${formatCurrency(this.y ?? 0)}</b><br/>`;
        },
      },
      plotOptions: { series: { marker: { enabled: false } } },
      // On narrow screens, show fewer date labels so they stay straight
      // instead of being rotated and squeezed together.
      responsive: {
        rules: [
          {
            condition: { maxWidth: 500 },
            chartOptions: {
              xAxis: { tickInterval: Math.max(1, Math.ceil(daily.length / 3)), labels: { rotation: 0 } },
            },
          },
        ],
      },
      series: [
        { type: 'line', name: 'Daily revenue', data: daily.map((d) => d.revenue), lineWidth: 1.5, opacity: 0.6 },
        { type: 'line', name: '7-day moving average', data: movingAverage, lineWidth: 3 },
      ],
    };
  }, [daily, movingAverage, theme]);

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

// memo: skip re-rendering when the parent re-renders with the same props.
export default memo(RevenueLineChart);
