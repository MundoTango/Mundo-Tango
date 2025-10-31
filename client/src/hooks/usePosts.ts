import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike as toggleLikeApi,
  getCommentsByPostId,
  createComment as createCommentApi,
  updateComment,
  deleteComment,
} from "@/lib/supabaseQueries";
import type { PostWithProfile, InsertPost, InsertComment, CommentWithProfile } from "@shared/supabase-types";

// ============================================================================
// POSTS WITH PAGINATION & REALTIME
// ============================================================================

export function usePosts() {
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  
  const query = useInfiniteQuery<PostWithProfile[]>({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const offset = pageParam as number;
      try {
        const data = await getPosts({ limit, offset });
        return data || [];
      } catch (error) {
        console.error("Failed to fetch posts:", error);
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
  });

  // Realtime subscription for new posts
  useEffect(() => {
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setNewPostsAvailable(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNewPosts = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    setNewPostsAvailable(false);
  };

  return {
    ...query,
    newPostsAvailable,
    loadNewPosts,
  };
}

export function usePost(id: string) {
  return useQuery<PostWithProfile>({
    queryKey: ["posts", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertPost, "user_id">) => {
      if (!user) throw new Error("Must be logged in");
      return createPost({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ============================================================================
// LIKES WITH OPTIMISTIC UPDATES
// ============================================================================

export function useToggleLike() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");
      return toggleLikeApi(user.id, postId);
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      
      const previousData = queryClient.getQueryData(["posts"]);
      
      queryClient.setQueryData<any>(["posts"], (old: any) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: PostWithProfile[]) =>
            page.map((post: PostWithProfile) =>
              post.id === postId
                ? { ...post, likes: (post.likes || 0) + 1 }
                : post
            )
          ),
        };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["posts"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ============================================================================
// COMMENTS WITH OPTIMISTIC UPDATES & REALTIME
// ============================================================================

export function useComments(postId: string) {
  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
  });

  // Realtime subscription for comments
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return query;
}

export function useCreateComment() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      if (!user) throw new Error("Must be logged in");
      return createCommentApi({
        user_id: user.id,
        post_id: data.postId,
        content: data.content,
      });
    },
    onMutate: async ({ postId, content }) => {
      if (!user) return;

      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      
      const previousComments = queryClient.getQueryData(["comments", postId]);
      
      const optimisticComment: CommentWithProfile = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        post_id: postId,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: {
          id: user.id,
          username: user.user_metadata?.username || user.email || "You",
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          bio: null,
          city: null,
          country: null,
          language: "en",
          timezone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      queryClient.setQueryData<CommentWithProfile[]>(["comments", postId], (old = []) => [
        ...old,
        optimisticComment,
      ]);

      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", variables.postId], context.previousComments);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}

export function useUpdateComment() {
  return useMutation({
    mutationFn: async ({ commentId, content, postId }: { commentId: string; content: string; postId: string }) => {
      return updateComment(commentId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}

export function useDeleteComment() {
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      return deleteComment(commentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
