import { memo, useMemo } from 'react';
import Highcharts from './highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import type { Theme } from '../../hooks/useTheme';
import type { GroupTotals } from '../../types';
import { getBaseChartOptions } from '../../utils/chartTheme';
import { formatNumber } from '../../utils/format';

interface ConversionsBarChartProps {
  byCampaign: GroupTotals[];
  theme: Theme;
}

/** Horizontal bars: long campaign names fit better on the side than below. */
function ConversionsBarChart({ byCampaign, theme }: ConversionsBarChartProps) {
  const options = useMemo<Highcharts.Options>(() => {
    const base = getBaseChartOptions(theme);
    // Biggest bar on top makes the chart easier to read.
    const sorted = [...byCampaign].sort((a, b) => b.conversions - a.conversions);

    return {
      ...base,
      chart: { ...base.chart, type: 'bar', height: 320 },
      xAxis: { ...(base.xAxis as Highcharts.XAxisOptions), categories: sorted.map((c) => c.key) },
      legend: { enabled: false },
      tooltip: {
        ...base.tooltip,
        pointFormatter() {
          return `Conversions: <b>${formatNumber(this.y ?? 0)}</b>`;
        },
      },
      plotOptions: { bar: { colorByPoint: true, borderRadius: 4, borderWidth: 0 } },
      series: [{ type: 'bar', name: 'Conversions', data: sorted.map((c) => c.conversions) }],
    };
  }, [byCampaign, theme]);

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export default memo(ConversionsBarChart);
