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

// REACTIONS (13 types: love, passion, fire, tango, celebrate, brilliant, support, hug, sad, cry, thinking, shock, angry)
export const useReactToPost = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ postId, reactionType }: ReactionMutation) => {
      return apiRequest('POST', `/api/posts/${postId}/react`, { reactionType });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', variables.postId] });
    },
    onError: () => {
      toast({
        title: "Reaction failed",
        description: "Could not react to post",
        variant: "destructive",
      });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/saved'] });
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
    onError: () => {
      toast({
        title: "Report failed",
        description: "Could not submit report",
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
