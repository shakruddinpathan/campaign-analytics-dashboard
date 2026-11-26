import { useCallback, useMemo, useState } from 'react';
import type { CampaignRecord, Filters } from '../types';

/**
 * Owns the filter state. The default date range is the full range of the
 * data, so the dashboard shows everything on first load.
 *
 * `records` must be sorted by date (first item = earliest date).
 */
export function useFilters(records: readonly CampaignRecord[]) {
  const dataRange = useMemo(
    () => ({
      min: records[0]?.date ?? '',
      max: records[records.length - 1]?.date ?? '',
    }),
    [records],
  );

  const defaultFilters: Filters = useMemo(
    () => ({ startDate: dataRange.min, endDate: dataRange.max, campaign: 'All', source: 'All' }),
    [dataRange],
  );

  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // One generic updater instead of four almost identical functions.
  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), [defaultFilters]);

  return { filters, updateFilter, resetFilters, dataRange };
}
