import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const FriendRequestCard = ({ request }) => {
  const queryClient = useQueryClient();

  const acceptRequest = useMutation(async () => {
    await axios.post(`/api/friends/friendship/${request.id}/accept`);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('friendRequests');
      queryClient.invalidateQueries('friends');
    }
  });

  const rejectRequest = useMutation(async () => {
    await axios.post(`/api/friends/friendship/${request.id}/reject`);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('friendRequests');
      queryClient.invalidateQueries('friends');
    }
  });

  return (
    <div>
      <p>{request.senderName}</p>
      <button onClick={() => acceptRequest.mutate()}>Accept</button>
      <button onClick={() => rejectRequest.mutate()}>Reject</button>
    </div>
  );
};

export default FriendRequestCard;