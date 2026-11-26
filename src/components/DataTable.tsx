import { memo, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RecordChange } from '@/hooks/useRecords';
import { useTableData } from '@/hooks/useTableData';
import { flashElement, ROW_EXIT_MS } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { CampaignRecord, SortConfig, SortKey } from '@/types';
import { downloadCsv } from '@/utils/csv';
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/utils/format';
import Pagination from './Pagination';

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'date', label: 'Date' },
  { key: 'campaign', label: 'Campaign' },
  { key: 'source', label: 'Source' },
  { key: 'clicks', label: 'Clicks', numeric: true },
  { key: 'conversions', label: 'Conversions', numeric: true },
  { key: 'revenue', label: 'Revenue', numeric: true },
];

/** aria-sort tells screen readers which column is sorted and in which direction. */
function ariaSort(sort: SortConfig, key: SortKey) {
  if (sort.key !== key) return 'none' as const;
  return sort.direction === 'asc' ? ('ascending' as const) : ('descending' as const);
}

function SortIcon({ sort, column }: { sort: SortConfig; column: SortKey }) {
  if (sort.key !== column) return <ArrowUpDown className="opacity-40" />;
  // key = direction → the arrow re-mounts and plays a small flip animation.
  return sort.direction === 'asc' ? (
    <ArrowUp key="asc" className="animate-in spin-in-90 fade-in-0 duration-200" />
  ) : (
    <ArrowDown key="desc" className="animate-in spin-in-90 fade-in-0 duration-200" />
  );
}

interface DataTableProps {
  records: CampaignRecord[];
  /** When this changes (e.g. the filters), the table goes back to page 1. */
  resetKey?: unknown;
  /** The last created/updated row: the table jumps to it and flashes it. */
  highlight?: RecordChange | null;
  onAdd?: () => void;
  onEdit?: (record: CampaignRecord) => void;
  onDelete?: (record: CampaignRecord) => void;
}

/**
 * Searchable, sortable, paginated table built with the shadcn Table.
 * All the data logic lives in the useTableData hook; this component only
 * renders, plus the CRUD buttons and their row animations.
 */
function DataTable({ records, resetKey, highlight, onAdd, onEdit, onDelete }: DataTableProps) {
  const { searchTerm, setSearchTerm, sort, toggleSort, pageResult, setPage, pageSize, setPageSize, allRows } =
    useTableData(records, resetKey ?? records);

  // Rows playing their delete animation. They are removed from the data
  // only AFTER the animation, otherwise they would vanish instantly.
  const [removingIds, setRemovingIds] = useState<ReadonlySet<string>>(new Set());
  const hasActions = Boolean(onEdit || onDelete);

  const handleDelete = (row: CampaignRecord) => {
    setRemovingIds((ids) => new Set(ids).add(row.id));
    setTimeout(() => {
      onDelete?.(row);
      setRemovingIds((ids) => {
        const next = new Set(ids);
        next.delete(row.id);
        return next;
      });
    }, ROW_EXIT_MS);
  };

  // After a create/update: open the page that has the row, scroll to it, flash it.
  const allRowsRef = useRef(allRows);
  allRowsRef.current = allRows;
  useEffect(() => {
    if (!highlight) return;
    const index = allRowsRef.current.findIndex((r) => r.id === highlight.id);
    if (index === -1) return; // hidden by filters or search
    setPage(Math.floor(index / pageSize) + 1);

    // Two animation frames = wait until React has rendered the new page.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const element = document.getElementById(`row-${highlight.id}`);
        element?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
        flashElement(element, highlight.type);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [highlight, pageSize, setPage]);

  // Changing the page, sort or page size re-mounts the body so the new rows fade in.
  const bodyKey = `${pageResult.currentPage}-${sort.key}-${sort.direction}-${pageSize}`;
  const columnCount = COLUMNS.length + 1 + (hasActions ? 1 : 0);

  return (
    <Card>
      {/* flex-wrap: title on the left, search + buttons on the right; they
          stack neatly on small phones. */}
      <CardHeader className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1.5">
          <CardTitle>Campaign data</CardTitle>
          <CardDescription>
            Click a column to sort. Export downloads every matching row.
            {onAdd && ' Add, edit or delete rows to see the dashboard update.'}
          </CardDescription>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search campaign, source, date…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              aria-label="Search table"
            />
          </div>
          {onAdd && (
            <Button onClick={onAdd} aria-label="Add row" className="group active:scale-95">
              <Plus className="transition-transform duration-300 group-hover:rotate-90" />
              <span className="hidden sm:inline">Add row</span>
            </Button>
          )}
          {/* Exports ALL matching rows, not only the current page. */}
          <Button
            variant={onAdd ? 'outline' : 'default'}
            onClick={() => downloadCsv(allRows)}
            disabled={allRows.length === 0}
            aria-label="Export CSV"
            className="group active:scale-95"
          >
            <Download className="transition-transform group-hover:translate-y-0.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableHead key={column.key} aria-sort={ariaSort(sort, column.key)} className={cn(column.numeric && 'text-right')}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort(column.key)}
                      className={cn('-mx-3', column.numeric && 'flex-row-reverse')}
                    >
                      {column.label}
                      <SortIcon sort={sort} column={column.key} />
                    </Button>
                  </TableHead>
                ))}
                <TableHead className="text-right">Conv. rate</TableHead>
                {hasActions && (
                  <TableHead className="w-20 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody key={bodyKey}>
              {pageResult.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnCount} className="h-24 animate-in text-center text-muted-foreground fade-in-0">
                    No rows match your search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageResult.items.map((row, index) => {
                  const removing = removingIds.has(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      id={`row-${row.id}`}
                      // Small stagger: each row starts 15 ms after the one above.
                      style={{ animationDelay: removing ? undefined : `${Math.min(index, 20) * 15}ms` }}
                      className={cn(
                        'group',
                        removing ? 'pointer-events-none animate-row-exit' : 'animate-row-in',
                      )}
                    >
                      <TableCell className="text-muted-foreground">{formatDate(row.date)}</TableCell>
                      <TableCell className="font-medium">{row.campaign}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(row.clicks)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(row.conversions)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(row.revenue)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(row.clicks ? (row.conversions / row.clicks) * 100 : 0)}
                      </TableCell>
                      {hasActions && (
                        <TableCell className="text-right">
                          {/* Faded until the row is hovered/focused, always visible on touch screens. */}
                          <div className="flex justify-end gap-1 transition-opacity sm:opacity-40 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onEdit(row)}
                                disabled={removing}
                                aria-label={`Edit ${row.campaign}, ${row.source}, ${formatDate(row.date)}`}
                                className="hover:scale-110 active:scale-95"
                              >
                                <Pencil />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(row)}
                                disabled={removing}
                                aria-label={`Delete ${row.campaign}, ${row.source}, ${formatDate(row.date)}`}
                                className="hover:scale-110 hover:bg-destructive/10 hover:text-destructive active:scale-95"
                              >
                                <Trash2 />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={pageResult.currentPage}
          totalPages={pageResult.totalPages}
          totalItems={pageResult.totalItems}
          startIndex={pageResult.startIndex}
          endIndex={pageResult.endIndex}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </CardContent>
    </Card>
  );
}

export default memo(DataTable);
