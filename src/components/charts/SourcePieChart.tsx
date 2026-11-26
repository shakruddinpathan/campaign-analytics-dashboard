import { memo, useMemo } from 'react';
import Highcharts from './highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import type { Theme } from '../../hooks/useTheme';
import type { GroupTotals } from '../../types';
import { getBaseChartOptions } from '../../utils/chartTheme';
import { formatNumber } from '../../utils/format';

interface SourcePieChartProps {
  bySource: GroupTotals[];
  theme: Theme;
}

/** Share of clicks per traffic source, drawn as a donut. */
function SourcePieChart({ bySource, theme }: SourcePieChartProps) {
  const options = useMemo<Highcharts.Options>(() => {
    const base = getBaseChartOptions(theme);
    const labelColor = theme === 'dark' ? '#d4d4d4' : '#404040';

    return {
      ...base,
      chart: { ...base.chart, type: 'pie', height: 320 },
      tooltip: {
        ...base.tooltip,
        pointFormatter() {
          return `Clicks: <b>${formatNumber(this.y ?? 0)}</b> (${(this.percentage ?? 0).toFixed(1)}%)`;
        },
      },
      plotOptions: {
        pie: {
          innerSize: '55%',
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f}%',
            style: { color: labelColor, textOutline: 'none', fontWeight: 'normal' },
          },
        },
      },
      series: [{ type: 'pie', name: 'Clicks', data: bySource.map((s) => ({ name: s.key, y: s.clicks })) }],
    };
  }, [bySource, theme]);

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export default memo(SourcePieChart);
