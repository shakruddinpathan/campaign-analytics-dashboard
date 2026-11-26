import { memo } from 'react';
import type { GroupTotals } from '@/types';
import { CHART_COLORS } from '@/utils/chartTheme';
import { formatCurrency, formatNumber } from '@/utils/format';

/**
 * "Top 5 campaigns by revenue". The list arrives already ranked by the
 * min-heap topK() algorithm, so this component only displays it.
 */
function TopCampaigns({ campaigns }: { campaigns: GroupTotals[] }) {
  if (campaigns.length === 0) {
    return <p className="text-sm text-muted-foreground">No data for the selected filters.</p>;
  }

  // The first item is the biggest; bar widths are relative to it.
  const maxRevenue = campaigns[0].revenue || 1;

  return (
    <ol className="space-y-5">
      {campaigns.map((campaign, index) => (
        <li key={campaign.key}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">
              <span className="mr-2 text-muted-foreground">{index + 1}</span>
              {campaign.key}
            </span>
            <span className="font-semibold tabular-nums">{formatCurrency(campaign.revenue)}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full"
              style={{ width: `${(campaign.revenue / maxRevenue) * 100}%`, backgroundColor: CHART_COLORS[0] }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(campaign.conversions)} conversions · {formatNumber(campaign.clicks)} clicks
          </p>
        </li>
      ))}
    </ol>
  );
}

export default memo(TopCampaigns);
