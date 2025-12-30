import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { likePost } from '../../api/posts';

interface PostCardProps {
  postId: string;
  initialLikes: number;
}

export default function PostCard({ postId, initialLikes }: PostCardProps) {
  const [likes, setLikes] = useState(initialLikes);
  const mutation = useMutation(likePost, {
    onMutate: () => {
      setLikes((prev) => prev + 1);
    },
    onError: (error, variables, context) => {
      setLikes((prev) => prev - 1);
    },
    onSettled: () => {
      // Optionally refetch or handle post like state
    }
  });

  const handleLike = () => {
    mutation.mutate(postId);
  };

  return (
    <div>
      <button onClick={handleLike}>Like</button>
      <span>{likes} Likes</span>
    </div>
  );
}