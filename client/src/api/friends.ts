import { apiRequest } from "@/lib/queryClient";

export interface Friend {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  mutualFriends?: number;
  closenessScore?: number;
  connectionDegree?: number;
  lastInteractionAt?: string;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  sender: Friend;
  status: string;
  createdAt: string;
  senderMessage?: string;
  danceStory?: string;
  danceLocation?: string;
  didWeDance?: boolean;
}

/**
 * Fetch all accepted friends for the current user
 */
export async function fetchFriends(): Promise<Friend[]> {
  try {
    const response = await fetch("/api/friends", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch friends");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
}

/**
 * Fetch pending friend requests for the current user
 */
export async function fetchFriendRequests(): Promise<FriendRequest[]> {
  try {
    const response = await fetch("/api/friends/requests", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch friend requests");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    throw error;
  }
}

/**
 * Fetch friend suggestions for the current user
 */
export async function fetchFriendSuggestions(): Promise<Friend[]> {
  try {
    const response = await fetch("/api/friends/suggestions", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch friend suggestions");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching friend suggestions:", error);
    throw error;
  }
}

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(
  userId: number,
  data: {
    message?: string;
    didWeDance?: boolean;
    danceLocation?: string;
    danceStory?: string;
    attachments?: string[];
  }
): Promise<any> {
  return apiRequest("POST", `/api/friends/request/${userId}`, data);
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: number): Promise<any> {
  return apiRequest("POST", `/api/friends/requests/${requestId}/accept`);
}

/**
 * Reject/decline a friend request
 */
export async function rejectFriendRequest(requestId: number): Promise<any> {
  return apiRequest("POST", `/api/friends/requests/${requestId}/reject`);
}

/**
 * Remove a friend
 */
export async function removeFriend(friendId: number): Promise<any> {
  return apiRequest("DELETE", `/api/friends/${friendId}`);
}

/**
 * Get mutual friends between current user and another user
 */
export async function fetchMutualFriends(userId: number): Promise<Friend[]> {
  try {
    const response = await fetch(`/api/friends/mutual/${userId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch mutual friends");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching mutual friends:", error);
    throw error;
  }
}

/**
 * Get friendship stats with another user
 */
export async function fetchFriendshipStats(friendId: number): Promise<any> {
  try {
    const response = await fetch(`/api/friends/friendship/${friendId}/stats`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch friendship stats");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching friendship stats:", error);
    throw error;
  }
}
