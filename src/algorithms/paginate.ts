/**
 * PAGINATION
 *
 * Idea: show only one "page" of rows at a time. For page p (starting at 1)
 * with s rows per page, the rows are from index (p - 1) × s up to p × s.
 *
 * Why: rendering 3,000+ table rows at once makes the browser slow. Showing
 * 10–50 rows keeps the DOM small and scrolling smooth.
 *
 * Time:  O(s) — slice copies only the rows of one page.
 * Space: O(s).
 */
export interface PageResult<T> {
  items: T[];
  currentPage: number; // the page actually shown (after clamping)
  totalPages: number;
  totalItems: number;
  startIndex: number; // 0-based index of the first item on this page
  endIndex: number; // 0-based index AFTER the last item (exclusive)
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): PageResult<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  // Even an empty list has "1 page", so the UI can still show "Page 1 of 1".
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  // Clamp: if filters shrink the data, page 30 may no longer exist.
  const currentPage = Math.min(Math.max(1, Math.floor(page)), totalPages);

  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalItems);

  return {
    items: items.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  };
}
