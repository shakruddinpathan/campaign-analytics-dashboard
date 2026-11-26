import { lazy, useCallback, useMemo, useState, type CSSProperties } from 'react';
import { ChartCard } from './components/ChartCard';
import DataTable from './components/DataTable';
import FilterBar from './components/FilterBar';
import { Header } from './components/Header';
import KpiGrid from './components/KpiGrid';
import { RecordFormDialog } from './components/RecordFormDialog';
import { Toaster } from './components/Toaster';
import TopCampaigns from './components/TopCampaigns';
import { CAMPAIGNS, MOCK_DATA, SOURCES } from './data/mockData';
import { useDashboardData } from './hooks/useDashboardData';
import { useFilters } from './hooks/useFilters';
import { useRecords } from './hooks/useRecords';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import type { CampaignRecord, RecordInput, TrafficSource } from './types';
import { filterRecords } from './utils/filterRecords';
import { formatCurrency, formatDate } from './utils/format';

// Lazy loading: Highcharts is the biggest library in the app. Loading the
// charts separately lets the KPI cards, filters and table appear first,
// while the charts download in the background.
const RevenueLineChart = lazy(() => import('./components/charts/RevenueLineChart'));
const ConversionsBarChart = lazy(() => import('./components/charts/ConversionsBarChart'));
const SourcePieChart = lazy(() => import('./components/charts/SourcePieChart'));

/** Page-load animation: each section fades up 70 ms after the one before. */
const enterDelay = (step: number): CSSProperties => ({ animationDelay: `${step * 70}ms` });

const describe = (r: RecordInput) => `${r.campaign} · ${r.source} · ${formatDate(r.date)}`;

/**
 * App = layout + wiring. State lives in hooks, logic lives in algorithms/utils,
 * and every section is its own small component.
 */
export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { records, lastChange, addRecord, updateRecord, deleteRecord, restoreRecord } = useRecords(MOCK_DATA);
  // The date range stays the original data range, so new rows must fall inside it.
  const { filters, updateFilter, resetFilters, dataRange } = useFilters(MOCK_DATA);
  const { filtered, kpis, byCampaign, bySource, topCampaigns, revenueTrend } = useDashboardData(records, filters);
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  // Form dialog state: open + which row is being edited (null = adding).
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CampaignRecord | null>(null);

  // New rows start with the latest date and the currently filtered campaign/source,
  // so they show up in the table right away.
  const newRecordDefaults: RecordInput = useMemo(
    () => ({
      date: dataRange.max,
      campaign: filters.campaign !== 'All' ? filters.campaign : CAMPAIGNS[0],
      source: (filters.source !== 'All' ? filters.source : SOURCES[0]) as TrafficSource,
      clicks: 1000,
      conversions: 40,
      revenue: 20000,
    }),
    [dataRange.max, filters.campaign, filters.source],
  );

  const openAdd = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((record: CampaignRecord) => {
    setEditing(record);
    setDialogOpen(true);
  }, []);

  const handleSubmit = (input: RecordInput) => {
    const hidden = filterRecords([{ ...input, id: '' }], filters).length === 0;
    const note = hidden ? ' (hidden by current filters)' : '';
    if (editing) {
      updateRecord(editing.id, input);
      showToast({ variant: 'success', title: `Row updated${note}`, description: describe(input) });
    } else {
      addRecord(input);
      showToast({
        variant: 'success',
        title: `Row added${note}`,
        description: `${describe(input)} · ${formatCurrency(input.revenue)}`,
      });
    }
  };

  const handleDelete = useCallback(
    (record: CampaignRecord) => {
      deleteRecord(record.id);
      showToast({
        variant: 'destructive',
        title: 'Row deleted',
        description: describe(record),
        action: { label: 'Undo', onClick: () => restoreRecord(record) },
      });
    },
    [deleteRecord, restoreRecord, showToast],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-fade-up" style={enterDelay(0)}>
          <Header theme={theme} onToggleTheme={toggleTheme} />
        </div>

        <div className="animate-fade-up" style={enterDelay(1)}>
          <FilterBar
            filters={filters}
            campaigns={CAMPAIGNS}
            sources={SOURCES}
            minDate={dataRange.min}
            maxDate={dataRange.max}
            onChange={updateFilter}
            onReset={resetFilters}
          />
        </div>

        <div className="animate-fade-up" style={enterDelay(2)}>
          <KpiGrid kpis={kpis} />
        </div>

        <div className="grid animate-fade-up grid-cols-1 gap-6 lg:grid-cols-3" style={enterDelay(3)}>
          <ChartCard title="Revenue over time" subtitle="Daily revenue with a 7-day moving average" className="lg:col-span-2">
            <RevenueLineChart daily={revenueTrend.daily} movingAverage={revenueTrend.average} theme={theme} />
          </ChartCard>
          <ChartCard title="Top 5 campaigns" subtitle="Ranked by revenue">
            <TopCampaigns campaigns={topCampaigns} />
          </ChartCard>
        </div>

        <div className="grid animate-fade-up grid-cols-1 gap-6 lg:grid-cols-2" style={enterDelay(4)}>
          <ChartCard title="Conversions by campaign">
            <ConversionsBarChart byCampaign={byCampaign} theme={theme} />
          </ChartCard>
          <ChartCard title="Traffic by source" subtitle="Share of total clicks">
            <SourcePieChart bySource={bySource} theme={theme} />
          </ChartCard>
        </div>

        <div className="animate-fade-up" style={enterDelay(5)}>
          <DataTable
            records={filtered}
            resetKey={filters}
            highlight={lastChange}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>

        <footer className="pb-4 text-center text-xs text-muted-foreground">
          Demo data generated in the browser · Built with React, TypeScript & Highcharts
        </footer>
      </main>

      <RecordFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editing}
        defaults={newRecordDefaults}
        campaigns={CAMPAIGNS}
        sources={SOURCES}
        minDate={dataRange.min}
        maxDate={dataRange.max}
        onSubmit={handleSubmit}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
