import { memo } from 'react';
import { IndianRupee, MousePointerClick, Percent, Target } from 'lucide-react';
import type { KpiTotals } from '@/types';
import { formatCompact, formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import KpiCard from './KpiCard';

/** The four KPI cards in a responsive grid: 1 column on phones, 4 on desktop. */
function KpiGrid({ kpis }: { kpis: KpiTotals }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Clicks" icon={MousePointerClick} value={formatCompact(kpis.clicks)} hint={formatNumber(kpis.clicks)} />
      <KpiCard
        label="Conversions"
        icon={Target}
        value={formatCompact(kpis.conversions)}
        hint={formatNumber(kpis.conversions)}
      />
      <KpiCard label="Revenue" icon={IndianRupee} value={`₹${formatCompact(kpis.revenue)}`} hint={formatCurrency(kpis.revenue)} />
      <KpiCard label="Conversion rate" icon={Percent} value={formatPercent(kpis.conversionRate)} hint="Conversions ÷ clicks" />
    </div>
  );
}

export default memo(KpiGrid);
