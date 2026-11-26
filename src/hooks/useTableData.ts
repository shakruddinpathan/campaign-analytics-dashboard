import { useEffect, useMemo, useState } from 'react';
import { paginate } from '../algorithms';
import type { CampaignRecord, SortConfig, SortKey } from '../types';
import { searchRecords } from '../utils/filterRecords';
import { sortRecords } from '../utils/sortRecords';
import { useDebouncedValue } from './useDebouncedValue';

/**
 * Table pipeline: rows → search (debounced) → merge sort → paginate.
 * The order matters: searching first means the sort works on fewer rows,
 * and paginating last means we only render one page.
 */
export function useTableData(records: readonly CampaignRecord[], resetKey: unknown = records) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const searched = useMemo(() => searchRecords(records, debouncedSearch), [records, debouncedSearch]);
  const sorted = useMemo(() => sortRecords(searched, sort), [searched, sort]);
  const pageResult = useMemo(() => paginate(sorted, page, pageSize), [sorted, page, pageSize]);

  // New search, new filters or new page size → go back to page 1, otherwise
  // the user could be stuck on a page that no longer has rows.
  // `resetKey` lets the parent pass the filters, so adding/editing/deleting a
  // row does NOT jump back to page 1 (paginate() clamps the page anyway).
  useEffect(() => setPage(1), [debouncedSearch, resetKey, pageSize]);

  /** Click same column = flip direction. Click new column = start ascending. */
  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  return {
    searchTerm,
    setSearchTerm,
    sort,
    toggleSort,
    pageResult,
    setPage,
    page,
    pageSize,
    setPageSize,
    allRows: sorted, // the full searched + sorted list, used for CSV export
  };
}
