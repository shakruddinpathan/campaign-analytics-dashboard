import { memoize, rangeByBinarySearch } from '../algorithms';
import type { CampaignRecord, Filters } from '../types';

/**
 * Applies all dashboard filters.
 *
 * Step 1: the date range uses BINARY SEARCH on the date-sorted data,
 *         which narrows thousands of rows in O(log n).
 * Step 2: campaign and source are checked only on the rows that are left.
 *
 * `records` MUST be sorted by date (MOCK_DATA already is).
 */
export function filterRecords(records: readonly CampaignRecord[], filters: Filters): CampaignRecord[] {
  const inDateRange = rangeByBinarySearch(records, filters.startDate, filters.endDate, (r) => r.date);

  return inDateRange.filter(
    (record) =>
      (filters.campaign === 'All' || record.campaign === filters.campaign) &&
      (filters.source === 'All' || record.source === filters.source),
  );
}

/**
 * Every dataset array gets a small number id. Rows can now be added, edited
 * and deleted, and each change creates a NEW array, so the id changes too.
 * WeakMap: when an old array is no longer used, its entry is garbage-collected.
 */
const datasetIds = new WeakMap<readonly CampaignRecord[], number>();
let nextDatasetId = 0;
function datasetId(records: readonly CampaignRecord[]): number {
  let id = datasetIds.get(records);
  if (id === undefined) {
    id = nextDatasetId++;
    datasetIds.set(records, id);
  }
  return id;
}

/**
 * Memoized version used by the app. The cache key = dataset id + filter
 * values, so the same data with the same filters is never filtered twice,
 * and a CRUD change (new array) never returns stale rows.
 */
export const filterRecordsCached = memoize(
  filterRecords,
  (records, filters) =>
    `${datasetId(records)}|${filters.startDate}|${filters.endDate}|${filters.campaign}|${filters.source}`,
  50,
);

/**
 * Text search across the visible text columns. Called with the DEBOUNCED
 * search term, so it runs only after the user pauses typing.
 */
export function searchRecords(records: readonly CampaignRecord[], term: string): CampaignRecord[] {
  const query = term.trim().toLowerCase();
  if (!query) return records as CampaignRecord[];

  return records.filter(
    (record) =>
      record.campaign.toLowerCase().includes(query) ||
      record.source.toLowerCase().includes(query) ||
      record.date.includes(query),
  );
}
