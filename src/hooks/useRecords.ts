import { useCallback, useState } from 'react';
import { upperBound } from '../algorithms';
import type { CampaignRecord, RecordInput } from '../types';

/** What changed last, so the table can play the right animation on that row. */
export interface RecordChange {
  id: string;
  type: 'created' | 'updated';
  /** Timestamp: a new value restarts the animation even for the same row. */
  at: number;
}

/**
 * Inserts a record while keeping the array sorted by date.
 * Binary search (upperBound) finds the position in O(log n); splice is O(n).
 * The date filter uses binary search too, so the data MUST stay sorted.
 */
function insertSorted(records: readonly CampaignRecord[], record: CampaignRecord): CampaignRecord[] {
  const index = upperBound(records, record.date, (r) => r.date);
  const next = records.slice();
  next.splice(index, 0, record);
  return next;
}

let idCounter = 0;
const createId = () => `custom-${Date.now()}-${idCounter++}`;

/**
 * CRUD state for the campaign rows (Create, Read, Update, Delete).
 * Every change returns a NEW array (immutable update), so useMemo in
 * useDashboardData notices it and recalculates KPIs and charts.
 */
export function useRecords(initialRecords: readonly CampaignRecord[]) {
  const [records, setRecords] = useState<CampaignRecord[]>(() => initialRecords.slice());
  const [lastChange, setLastChange] = useState<RecordChange | null>(null);

  const addRecord = useCallback((input: RecordInput): CampaignRecord => {
    const record: CampaignRecord = { ...input, id: createId() };
    setRecords((previous) => insertSorted(previous, record));
    setLastChange({ id: record.id, type: 'created', at: Date.now() });
    return record;
  }, []);

  const updateRecord = useCallback((id: string, input: RecordInput) => {
    // Remove + re-insert, because the date may have changed (sorted order).
    setRecords((previous) =>
      insertSorted(
        previous.filter((r) => r.id !== id),
        { ...input, id },
      ),
    );
    setLastChange({ id, type: 'updated', at: Date.now() });
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((previous) => previous.filter((r) => r.id !== id));
  }, []);

  /** Used by the "Undo" button in the toast after a delete. */
  const restoreRecord = useCallback((record: CampaignRecord) => {
    setRecords((previous) => (previous.some((r) => r.id === record.id) ? previous : insertSorted(previous, record)));
    setLastChange({ id: record.id, type: 'created', at: Date.now() });
  }, []);

  return { records, lastChange, addRecord, updateRecord, deleteRecord, restoreRecord };
}
