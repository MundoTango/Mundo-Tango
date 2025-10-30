import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  getCommentsByPostId,
  createComment,
} from "@/lib/supabaseQueries";
import type { PostWithProfile, InsertPost, InsertComment } from "@shared/supabase-types";

export function usePosts() {
  return useQuery<PostWithProfile[]>({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });
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

export function useToggleLike() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");
      return toggleLike(user.id, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      if (!user) throw new Error("Must be logged in");
      return createComment({
        user_id: user.id,
        post_id: data.postId,
        content: data.content,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}
