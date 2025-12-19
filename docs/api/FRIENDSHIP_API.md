# Friendship API Documentation

## Overview
Comprehensive friend request system with suggestions, mutual friends, connection degrees, and snooze functionality.

**Base URL:** `/api/friends`

**Authentication:** All endpoints require JWT Bearer token

**Rate Limits:** 100 requests/minute per user

---

## Table of Contents
1. [Friend Management](#friend-management)
2. [Friend Requests](#friend-requests)
3. [Friend Suggestions](#friend-suggestions)
4. [Social Graph](#social-graph)

---

## Friend Management

### Get User's Friends
```
GET /api/friends
```

Retrieve list of user's current friends.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 456,
    "username": "janedoe",
    "name": "Jane Doe",
    "profileImage": "https://...",
    "bio": "Tango teacher in BA",
    "city": "Buenos Aires",
    "friendshipId": 789,
    "closenessScore": 85,
    "mutualFriends": 12,
    "friendsSince": "2024-01-15T10:30:00Z"
  }
]
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | integer | Results per page (default: 50) |
| offset | integer | Pagination offset (default: 0) |
| sort | string | Sort by: `recent`, `closeness`, `name` |

**cURL Example:**
```bash
curl -X GET https://api.mundotango.com/api/friends?limit=20&sort=closeness \
  -H "Authorization: Bearer <token>"
```

**TypeScript Example:**
```typescript
import { useQuery } from '@tanstack/react-query';

const useFriends = () => {
  return useQuery({
    queryKey: ['/api/friends'],
    queryFn: async () => {
      const res = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return res.json();
    }
  });
};
```

---

### Remove Friend
```
DELETE /api/friends/:friendId
```

Unfriend a user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

**Error Responses:**
- `404 Not Found` - Friendship doesn't exist
- `500 Internal Server Error`

---

## Friend Requests

### Get Received Friend Requests
```
GET /api/friends/requests
```

Get pending friend requests received by the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 123,
    "sender": {
      "id": 789,
      "username": "newuser",
      "name": "New User",
      "profileImage": "https://...",
      "city": "Montevideo",
      "mutualFriends": 5
    },
    "message": "Hi! I saw you at the milonga last night",
    "requestedAt": "2024-11-01T14:20:00Z",
    "status": "pending",
    "snoozedUntil": null
  }
]
```

**cURL Example:**
```bash
curl -X GET https://api.mundotango.com/api/friends/requests \
  -H "Authorization: Bearer <token>"
```

---

### Send Friend Request
```
POST /api/friends/request/:userId
```

Send a friend request to another user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "message": "Hi! Would love to connect and dance together sometime",
  "context": "Met at milonga"
}
```

**Response (201 Created):**
```json
{
  "id": 456,
  "senderId": 123,
  "receiverId": 789,
  "message": "Hi! Would love to connect...",
  "status": "pending",
  "createdAt": "2024-11-02T10:15:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Already friends or request pending
- `404 Not Found` - User not found
- `500 Internal Server Error`

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/friends/request/789 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi! Would love to connect",
    "context": "Met at milonga"
  }'
```

**TypeScript Example:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, message }: { userId: number, message: string }) => {
      return apiRequest(`/api/friends/request/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
    }
  });
};
```

---

### Accept Friend Request
```
POST /api/friends/requests/:requestId/accept
```

Accept a pending friend request.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "response": "Thanks! Looking forward to dancing together!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "friendship": {
    "id": 999,
    "friendId": 789,
    "createdAt": "2024-11-02T11:00:00Z",
    "closenessScore": 75
  }
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/friends/requests/123/accept \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"response": "Thanks! Looking forward to it!"}'
```

---

### Reject Friend Request
```
POST /api/friends/requests/:requestId/reject
```

Decline a friend request.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Friend request rejected"
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/friends/requests/123/reject \
  -H "Authorization: Bearer <token>"
```

---

### Snooze Friend Request
```
POST /api/friends/requests/:requestId/snooze
```

Temporarily hide a friend request (re-appears after specified days).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "days": 7
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "snoozedUntil": "2024-11-09T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid days parameter
- `404 Not Found` - Request not found
- `500 Internal Server Error`

---

## Friend Suggestions

### Get Friend Suggestions
```
GET /api/friends/suggestions
```

Get AI-powered friend suggestions based on mutual friends, location, interests.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "user": {
      "id": 567,
      "username": "milaactual",
      "name": "Mila Tango",
      "profileImage": "https://...",
      "city": "Buenos Aires",
      "bio": "Advanced follower, 8 years experience"
    },
    "mutualFriends": 8,
    "mutualGroups": 2,
    "matchScore": 92,
    "matchReasons": [
      "8 mutual friends",
      "Both in Buenos Aires Tango Community",
      "Similar skill level"
    ]
  }
]
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | integer | Number of suggestions (default: 10, max: 50) |
| minMutualFriends | integer | Minimum mutual friends (default: 1) |

**cURL Example:**
```bash
curl -X GET "https://api.mundotango.com/api/friends/suggestions?limit=20" \
  -H "Authorization: Bearer <token>"
```

**TypeScript Example:**
```typescript
const useFriendSuggestions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['/api/friends/suggestions', limit],
    queryFn: async () => {
      const res = await fetch(`/api/friends/suggestions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return res.json();
    }
  });
};
```

---

## Social Graph

### Get Mutual Friends
```
GET /api/friends/mutual/:userId
```

Get list of mutual friends with another user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "count": 5,
  "mutualFriends": [
    {
      "id": 234,
      "username": "carlos_tango",
      "name": "Carlos Martinez",
      "profileImage": "https://...",
      "city": "Buenos Aires"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET https://api.mundotango.com/api/friends/mutual/789 \
  -H "Authorization: Bearer <token>"
```

---

### Get Connection Degree
```
GET /api/friends/connection-degree/:userId
```

Calculate degree of separation between users (1 = direct friend, 2 = friend of friend, etc.)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "degree": 2,
  "path": [
    {
      "id": 123,
      "name": "You"
    },
    {
      "id": 456,
      "name": "Jane Doe"
    },
    {
      "id": 789,
      "name": "Target User"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - No connection found (degree > 6)
- `500 Internal Server Error`

---

## Error Codes Reference

| Code | Message | Description |
|------|---------|-------------|
| 400 | Already friends | Friend request to existing friend |
| 400 | Request already pending | Duplicate friend request |
| 401 | Unauthorized | Authentication required |
| 403 | Blocked | User has blocked you |
| 404 | User not found | Target user doesn't exist |
| 404 | Request not found | Friend request doesn't exist |
| 404 | No connection found | Users not connected (degree > 6) |
| 500 | Internal server error | Server-side error |

---

## Complete Workflow Example

### Sending and Accepting Friend Requests

```typescript
// Component for sending friend request
const SendFriendRequest = ({ userId }: { userId: number }) => {
  const sendRequest = useSendFriendRequest();
  
  const handleSend = async () => {
    await sendRequest.mutateAsync({
      userId,
      message: "Hi! Let's connect!"
    });
  };
  
  return (
    <button 
      onClick={handleSend}
      disabled={sendRequest.isPending}
    >
      {sendRequest.isPending ? 'Sending...' : 'Add Friend'}
    </button>
  );
};

// Component for managing friend requests
const FriendRequests = () => {
  const { data: requests } = useQuery({
    queryKey: ['/api/friends/requests']
  });
  
  const acceptRequest = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest(`/api/friends/requests/${requestId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ response: "Great to connect!" })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
    }
  });
  
  return (
    <div>
      {requests?.map(request => (
        <div key={request.id}>
          <p>{request.sender.name}</p>
          <button onClick={() => acceptRequest.mutate(request.id)}>
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Rate Limiting

All friendship endpoints share a rate limit of **100 requests/minute** per authenticated user.

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Best Practices

1. **Check Mutual Friends**: Display mutual friend count to increase acceptance rate
2. **Add Context**: Include a personalized message with friend requests
3. **Respect Privacy**: Don't spam users with repeated requests
4. **Use Suggestions**: Leverage AI suggestions for better matches
5. **Handle Snooze**: Respect snoozed requests - they'll reappear automatically
6. **Cache Wisely**: Cache friend lists but invalidate on mutations
7. **Show Connection Path**: Display connection degree to build trust

---
