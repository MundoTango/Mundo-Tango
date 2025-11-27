import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface ReactionMutation {
  postId: number;
  reactionType: string;
}

export interface ShareMutation {
  postId: number;
  shareType: 'timeline' | 'comment' | 'link';
  comment?: string;
}

export interface SaveMutation {
  postId: number;
}

export interface ReportMutation {
  postId: number;
  category: string;
  description: string;
}

export interface CommentLikeMutation {
  commentId: number;
}

// REACTIONS (13 types: love, passion, romance, joy, wow, celebration, tango_dancer, tango_leader, music, elegance, support, inspiration, sad)
export const useReactToPost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId, reactionType }: ReactionMutation) => {
      return apiRequest('POST', `/api/posts/${postId}/react`, { reactionType });
    },
    onMutate: async ({ postId, reactionType }) => {
      // Cancel outgoing refetches for both query types
      await queryClient.cancelQueries({ queryKey: ['/api/posts'] });
      await queryClient.cancelQueries({ queryKey: ['infinite-feed'] });
      
      // Snapshot previous values
      const previousPostsData = queryClient.getQueryData(['/api/posts']);
      
      // Helper function to update a post
      const updatePost = (post: any) => {
        if (post.id === postId) {
          const likesChange = reactionType === '' ? -1 : (post.currentReaction ? 0 : 1);
          return {
            ...post,
            likes: Math.max(0, (post.likes || 0) + likesChange),
            currentReaction: reactionType === '' ? undefined : reactionType,
          };
        }
        return post;
      };
      
      // Update regular posts cache
      queryClient.setQueryData<any>(['/api/posts'], (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map(updatePost);
        }
        return old;
      });
      
      // Update infinite feed cache (handles ['infinite-feed', feedType, filter])
      queryClient.setQueriesData<any>({ queryKey: ['infinite-feed'] }, (old: any) => {
        if (!old || !old.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => {
            // Handle FeedResponse structure: { posts: Post[], nextOffset, hasMore }
            if (page.posts && Array.isArray(page.posts)) {
              return {
                ...page,
                posts: page.posts.map(updatePost),
              };
            }
            // Handle simple array structure
            if (Array.isArray(page)) {
              return page.map(updatePost);
            }
            return page;
          }),
        };
      });
      
      return { previousPostsData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPostsData) {
        queryClient.setQueryData(['/api/posts'], context.previousPostsData);
      }
      // Refetch to get correct state
      queryClient.invalidateQueries({ queryKey: ['infinite-feed'] });
      toast({
        title: "Reaction failed",
        description: "Could not react to post",
        variant: "destructive",
      });
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['infinite-feed'] });
    },
  });
};

// SHARE
export const useSharePost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId, shareType, comment }: ShareMutation) => {
      return apiRequest('POST', `/api/posts/${postId}/share`, { shareType, comment });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', variables.postId] });
      toast({
        title: "Post shared",
        description: "Your share was successful",
      });
    },
    onError: () => {
      toast({
        title: "Share failed",
        description: "Could not share post",
        variant: "destructive",
      });
    },
  });
};

// SAVE
export const useSavePost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId }: SaveMutation) => {
      return apiRequest('POST', `/api/posts/${postId}/save`);
    },
    onMutate: async ({ postId }) => {
      // Update infinite feed with isSaved: true
      queryClient.setQueriesData<any>({ queryKey: ['infinite-feed'] }, (old: any) => {
        if (!old || !old.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => {
            if (page.posts && Array.isArray(page.posts)) {
              return {
                ...page,
                posts: page.posts.map((post: any) => 
                  post.id === postId ? { ...post, isSaved: true } : post
                ),
              };
            }
            if (Array.isArray(page)) {
              return page.map((post: any) =>
                post.id === postId ? { ...post, isSaved: true } : post
              );
            }
            return page;
          }),
        };
      });

      // Update single post queries
      queryClient.setQueryData<any>(['/api/posts', postId], (old: any) => 
        old ? { ...old, isSaved: true } : old
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/saved'] });
      toast({
        title: "Post saved",
        description: "Added to your saved posts",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Could not save post",
        variant: "destructive",
      });
    },
  });
};

export const useUnsavePost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId }: SaveMutation) => {
      return apiRequest('DELETE', `/api/posts/${postId}/save`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/saved'] });
      toast({
        title: "Post unsaved",
        description: "Removed from your saved posts",
      });
    },
    onError: () => {
      toast({
        title: "Unsave failed",
        description: "Could not unsave post",
        variant: "destructive",
      });
    },
  });
};

// REPORT
export const useReportPost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId, category, description }: ReportMutation) => {
      return apiRequest('POST', `/api/posts/${postId}/report`, { reason: category, details: description });
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      });
    },
    onError: (err: any) => {
      console.error('Report error:', err);
      toast({
        title: "Report failed",
        description: "Could not submit report",
        variant: "destructive",
      });
    },
  });
};

// EDIT
export const useEditPost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId, data }: { postId: number; data: any }) => {
      return apiRequest('PATCH', `/api/posts/${postId}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: ['/api/posts'] });
      queryClient.removeQueries({ queryKey: ['infinite-feed'] });
      queryClient.removeQueries({ queryKey: ['/api/posts', variables.postId] });
      
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/posts'] });
        queryClient.refetchQueries({ queryKey: ['infinite-feed'] });
      }, 100);
      
      toast({
        title: "Post updated",
        description: "Your changes have been saved",
      });
    },
    onError: (err: any) => {
      console.error('Edit error:', err);
      toast({
        title: "Update failed",
        description: "Could not update post",
        variant: "destructive",
      });
    },
  });
};

// DELETE
export const useDeletePost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId }: SaveMutation) => {
      return apiRequest('DELETE', `/api/posts/${postId}`);
    },
    onSuccess: (_, variables) => {
      // Clear all feed-related caches
      queryClient.removeQueries({ queryKey: ['/api/posts'] });
      queryClient.removeQueries({ queryKey: ['infinite-feed'] });
      queryClient.removeQueries({ queryKey: ['/api/posts', variables.postId] });
      
      // Also refetch to ensure consistency
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/posts'] });
        queryClient.refetchQueries({ queryKey: ['infinite-feed'] });
      }, 100);
      
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Could not delete post",
        variant: "destructive",
      });
    },
  });
};

// COMMENT LIKES
export const useLikeComment = () => {
  return useMutation({
    mutationFn: async ({ commentId }: CommentLikeMutation) => {
      return apiRequest('POST', `/api/comments/${commentId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });
};
