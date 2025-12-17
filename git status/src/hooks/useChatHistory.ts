import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import type { SelectMrBlueMessage } from '@shared/schema';

export function useChatHistory(conversationId: number | null) {
  const { ref, inView } = useInView();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['/api/mr-blue/conversations', conversationId, 'messages'],
    queryFn: async ({ pageParam = 0 }) => {
      if (!conversationId) return [];
      
      const response = await fetch(
        `/api/mr-blue/conversations/${conversationId}/messages?offset=${pageParam}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return response.json() as Promise<SelectMrBlueMessage[]>;
    },
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === 50 ? pages.length * 50 : undefined,
    enabled: !!conversationId,
  });
  
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  const messages = data?.pages.flatMap(page => page) ?? [];
  
  return { 
    messages, 
    loadMoreRef: ref, 
    isLoadingMore: isFetchingNextPage,
    isLoading,
  };
}
