import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

// Express API uses serial IDs, not UUIDs
type Post = {
  id: number;
  userId: number;
  content: string;
  richContent?: string | null;
  plainText?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  mediaEmbeds?: string[];
  mentions?: string[];
  hashtags?: string[];
  location?: string | null;
  visibility: string;
  postType: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    email: string;
    profileImage?: string | null;
  };
};

type Comment = {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    email: string;
    profileImage?: string | null;
  };
};

type InsertPost = {
  content: string;
  richContent?: string;
  plainText?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaEmbeds?: string[];
  mentions?: string[];
  hashtags?: string[];
  location?: string;
  visibility?: string;
  postType?: string;
};

type InsertComment = {
  content: string;
};

// ============================================================================
// POSTS WITH PAGINATION (NO REALTIME - USING EXPRESS API)
// ============================================================================

export function usePosts() {
  const query = useInfiniteQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const offset = pageParam as number;
      
      try {
        const res = await fetch(`/api/posts?limit=${limit}&offset=${offset}`);
        
        // Handle authentication errors gracefully
        if (res.status === 401 || res.status === 403) {
          console.log('[usePosts] Authentication required - returning empty array');
          return [];
        }
        
        // Handle other errors
        if (!res.ok) {
          console.error('[usePosts] Failed to fetch posts:', res.status, res.statusText);
          return [];
        }
        
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('[usePosts] Network error fetching posts:', error);
        return [];
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !Array.isArray(lastPage) || lastPage.length < 10) {
        return undefined;
      }
      return allPages.length * 10;
    },
    initialPageParam: 0,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  return {
    ...query,
    newPostsAvailable: false,
    loadNewPosts: () => queryClient.invalidateQueries({ queryKey: ["/api/posts"] }),
  };
}

export function usePost(id: number | string) {
  return useQuery<Post>({
    queryKey: ["/api/posts", id.toString()],
    enabled: !!id,
  });
}

export function useCreatePost() {
  return useMutation({
    mutationFn: async (data: InsertPost) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
}

export function useDeletePost() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
}

// ============================================================================
// LIKES WITH OPTIMISTIC UPDATES
// ============================================================================

export function useToggleLike(postId: number | string) {
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${postId}/like`);
      return await res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["/api/posts"] });
      
      const previousPostsData = queryClient.getQueryData(["/api/posts"]);
      
      // Optimistically update posts cache (toggle like)
      queryClient.setQueryData<any>(["/api/posts"], (old: any) => {
        if (!old) return old;
        
        if (old.pages) {
          // Handle infinite query
          return {
            ...old,
            pages: old.pages.map((page: Post[]) =>
              page.map((post: Post) =>
                post.id === Number(postId)
                  ? { ...post, likes: post.likes + 1 }
                  : post
              )
            ),
          };
        }
        
        return old;
      });
      
      return { previousPostsData };
    },
    onError: (err, variables, context) => {
      if (context?.previousPostsData) {
        queryClient.setQueryData(["/api/posts"], context.previousPostsData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  return {
    ...mutation,
    isLiked: false,
    isLikeLoading: false,
  };
}

// ============================================================================
// COMMENTS WITH OPTIMISTIC UPDATES
// ============================================================================

export function useComments(postId: number | string) {
  return useQuery<Comment[]>({
    queryKey: ["/api/posts", postId.toString(), "comments"],
    enabled: !!postId,
  });
}

export function useCreateComment() {
  return useMutation({
    mutationFn: async (data: { postId: number; content: string; parentId?: number | null }) => {
      const res = await apiRequest("POST", `/api/posts/${data.postId}/comments`, {
        content: data.content,
        parentId: data.parentId || null,
      });
      return await res.json();
    },
    onMutate: async ({ postId, content }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/posts", postId.toString(), "comments"] });
      
      const previousComments = queryClient.getQueryData(["/api/posts", postId.toString(), "comments"]);
      
      const optimisticComment: Comment = {
        id: Date.now(),
        userId: 0,
        postId,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Comment[]>(["/api/posts", postId.toString(), "comments"], (old = []) => [
        ...old,
        optimisticComment,
      ]);

      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["/api/posts", variables.postId.toString(), "comments"], context.previousComments);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", variables.postId.toString(), "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
}

export function useUpdateComment() {
  return useMutation({
    mutationFn: async ({ commentId, content, postId }: { commentId: number; content: string; postId: number }) => {
      const res = await apiRequest("PUT", `/api/comments/${commentId}`, { content });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", variables.postId.toString(), "comments"] });
    },
  });
}

export function useDeleteComment() {
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: number; postId: number }) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", variables.postId.toString(), "comments"] });
    },
  });
}
