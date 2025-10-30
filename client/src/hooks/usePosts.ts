import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SelectPost, InsertPost, InsertPostComment } from "@shared/schema";

export function usePosts(userId?: number) {
  return useQuery<SelectPost[]>({
    queryKey: userId ? ["/api/posts", { userId }] : ["/api/posts"],
    enabled: true,
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ["/api/posts", id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
  });
}

export function useCreatePost() {
  return useMutation({
    mutationFn: async (data: InsertPost) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
}

export function useUpdatePost(id: number) {
  return useMutation({
    mutationFn: async (data: Partial<InsertPost>) => {
      const res = await apiRequest("PUT", `/api/posts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", id] });
    },
  });
}

export function useDeletePost(id: number) {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
}

export function useLikePost(id: number) {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${id}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", id] });
    },
  });
}

export function useCreateComment(postId: number) {
  return useMutation({
    mutationFn: async (data: Omit<InsertPostComment, "postId" | "userId">) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
    },
  });
}
