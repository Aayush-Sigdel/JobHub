export const CANDIDATE_PAGE_SIZES = [10, 25, 50] as const;

export function pageCount(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize));
}

export function clampPage(page: number, totalItems: number, pageSize: number) {
  return Math.min(Math.max(1, page), pageCount(totalItems, pageSize));
}

export function paginateCandidates<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
) {
  const safePage = clampPage(page, items.length, pageSize);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    pageCount: pageCount(items.length, pageSize),
    start,
    end: Math.min(start + pageSize, items.length),
    items: items.slice(start, start + pageSize),
  };
}
