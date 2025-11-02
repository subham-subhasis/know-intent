import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

export interface PageData<T> {
  data: T[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface UseInfiniteScrollOptions<T> {
  queryKey: string[];
  fetchFn: (cursor?: string) => Promise<PageData<T>>;
  enabled?: boolean;
}

export function useInfiniteScroll<T extends { id: string }>({
  queryKey,
  fetchFn,
  enabled = true,
}: UseInfiniteScrollOptions<T>) {
  const isFetchingMore = useRef(false);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchFn(pageParam as string | undefined),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    enabled,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const allItems = query.data?.pages.flatMap((page) => page.data) ?? [];

  const uniqueItems = allItems.reduce((acc, item) => {
    if (!acc.some((i) => i.id === item.id)) {
      acc.push(item);
    }
    return acc;
  }, [] as T[]);

  const handleLoadMore = useCallback(() => {
    if (
      !query.isFetchingNextPage &&
      !query.isLoading &&
      query.hasNextPage &&
      !isFetchingMore.current
    ) {
      isFetchingMore.current = true;
      query.fetchNextPage().finally(() => {
        isFetchingMore.current = false;
      });
    }
  }, [query]);

  const handleRefresh = useCallback(async () => {
    isFetchingMore.current = false;
    await query.refetch();
  }, [query]);

  return {
    data: uniqueItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isFetchingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore: handleLoadMore,
    refresh: handleRefresh,
    retry: query.refetch,
  };
}
