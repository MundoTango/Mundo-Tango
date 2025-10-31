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

export function useToggleLike(postId: string) {
  const { user } = useAuth();

  // Get user's like state for this post
  const { data: userLike, isLoading: isLikeLoading } = useQuery({
    queryKey: ['user-like', postId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!postId,
  });

  const mutation = useMutation({
    mutationFn: async (currentlyLiked?: boolean) => {
      if (!user) throw new Error("Must be logged in");
      return toggleLikeApi(user.id, postId);
    },
    onMutate: async (currentlyLiked?: boolean) => {
      if (!user) return;
      
      // Cancel outgoing refetches for both posts and user-like
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ['user-like', postId, user.id] });
      
      const previousPostsData = queryClient.getQueryData(["posts"]);
      const previousUserLike = queryClient.getQueryData(['user-like', postId, user.id]);
      
      // Use passed state if available, otherwise fall back to query (should be loaded by now)
      const isLiked = currentlyLiked !== undefined ? currentlyLiked : !!userLike;
      const delta = isLiked ? -1 : +1; // Decrement if unlike, increment if like
      
      // Optimistically update posts cache (like count)
      queryClient.setQueryData<any>(["posts"], (old: any) => {
        if (!old) return old;
        
        if (old.pages) {
          // Handle infinite query
          return {
            ...old,
            pages: old.pages.map((page: PostWithProfile[]) =>
              page.map((post: PostWithProfile) =>
                post.id === postId
                  ? { ...post, likes: [{ count: (post.likes?.[0]?.count || 0) + delta }] }
                  : post
              )
            ),
          };
        }
        
        // Handle regular query
        return old.map((post: any) => 
          post.id === postId
            ? { ...post, likes: [{ count: (post.likes?.[0]?.count || 0) + delta }] }
            : post
        );
      });
      
      // Optimistically update user-like cache (liked state)
      queryClient.setQueryData(['user-like', postId, user.id], isLiked ? null : { id: 'temp-like' });
      
      return { previousPostsData, previousUserLike };
    },
    onError: (err, variables, context) => {
      if (!user) return;
      
      // Rollback both caches on error
      if (context?.previousPostsData) {
        queryClient.setQueryData(["posts"], context.previousPostsData);
      }
      if (context?.previousUserLike !== undefined) {
        queryClient.setQueryData(['user-like', postId, user.id], context.previousUserLike);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ['user-like', postId] });
    },
  });

  return {
    ...mutation,
    isLiked: !!userLike,
    isLikeLoading,
  };
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
          email_notifications: true,
          push_notifications: true,
          profile_visibility: 'public' as const,
          location_sharing: true,
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
