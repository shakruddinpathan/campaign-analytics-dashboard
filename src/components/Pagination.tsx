import { memo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber } from '@/utils/format';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

function Pagination(props: PaginationProps) {
  const { currentPage, totalPages, totalItems, startIndex, endIndex, pageSize, onPageChange, onPageSizeChange } = props;
  // Show "0–0" for an empty table instead of the confusing "1–0".
  const from = totalItems === 0 ? 0 : startIndex + 1;
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Table pagination">
      <p className="text-muted-foreground">
        Showing <span className="font-medium text-foreground">{formatNumber(from)}</span>–
        <span className="font-medium text-foreground">{formatNumber(endIndex)}</span> of{' '}
        <span className="font-medium text-foreground">{formatNumber(totalItems)}</span> rows
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger size="sm" className="w-20" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={isFirst} aria-label="First page">
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(currentPage - 1)} disabled={isFirst} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(currentPage + 1)} disabled={isLast} aria-label="Next page">
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={isLast} aria-label="Last page">
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default memo(Pagination);
