import { mergeSort } from '../algorithms';
import type { CampaignRecord, SortConfig } from '../types';

/**
 * Sorts table rows with our own merge sort.
 * Strings are compared with localeCompare; numbers by subtraction.
 * For "desc", the comparison result is simply flipped.
 */
export function sortRecords(records: readonly CampaignRecord[], sort: SortConfig): CampaignRecord[] {
  const direction = sort.direction === 'asc' ? 1 : -1;

  return mergeSort(records, (a, b) => {
    const valueA = a[sort.key];
    const valueB = b[sort.key];

    const result =
      typeof valueA === 'number' && typeof valueB === 'number'
        ? valueA - valueB
        : String(valueA).localeCompare(String(valueB));

    return result * direction;
  });
}
