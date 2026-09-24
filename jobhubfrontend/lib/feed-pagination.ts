export const FEED_PAGE_SIZE = 6;

export function paginateFeed<T>(items: readonly T[], requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / FEED_PAGE_SIZE));
  const page = Math.min(
    pageCount,
    Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1),
  );
  const start = (page - 1) * FEED_PAGE_SIZE;
  const firstVisiblePage = Math.max(1, Math.min(page - 2, pageCount - 4));

  return {
    page,
    pageCount,
    start,
    end: Math.min(start + FEED_PAGE_SIZE, items.length),
    items: items.slice(start, start + FEED_PAGE_SIZE),
    pages: Array.from(
      { length: Math.min(5, pageCount) },
      (_, index) => firstVisiblePage + index,
    ),
  };
}
