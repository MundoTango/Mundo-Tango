# Friends List Feature Implementation Plan

## Overview

As part of our audits, we found that the `/friends-list` route returns a 404 for standard users. This indicates that the Friends List page has not been implemented in the frontend code. To address this, we propose the following code changes based on the patterns and methodologies defined in `mb.md`.

## UI Errors Observed

- The navigation sidebar includes a "Friends" link, but clicking it results in a 404 page.
- There is no page component under `client/src/pages` to render the friends list.
- The router does not define a route for `/friends-list`.
- There are no API helpers to fetch friends and friend requests data.

## Proposed Code Changes

### 1. Create FriendsListPage component

Create a new file `client/src/pages/FriendsListPage.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { fetchFriends, fetchFriendRequests } from '../api/friends';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

const FriendsListPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const friendsData = await fetchFriends();
        const requestsData = await fetchFriendRequests();
        setFriends(friendsData);
        setRequests(requestsData);
      } catch (err) {
        setError('Failed to load friends');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div>Loading friends...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul>
            {requests.map((req) => (
              <li key={req.id} className="mb-2">
                <span>{req.name} (@{req.username})</span>
                {/* Buttons to accept/reject request can be added here */}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
        {friends.length === 0 ? (
          <p>You haven't added any friends yet.</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li key={friend.id} className="mb-2">
                <span>{friend.name} (@{friend.username})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default FriendsListPage;
```

This component fetches friends and pending friend requests using API helpers, handles loading and error states, and renders lists with simple UI. It follows MB.MD guidelines by providing clear feedback to users and including empty states.

### 2. Add API helpers

Create a new file `client/src/api/friends.ts`:

```ts
export async function fetchFriends() {
  const response = await fetch('/api/friends', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to fetch friends');
  }
  return await response.json();
}

export async function fetchFriendRequests() {
  const response = await fetch('/api/friends/requests', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to fetch friend requests');
  }
  return await response.json();
}
```

These helpers call the backend to retrieve friend lists. They assume existing endpoints; if the backend does not support these endpoints, they should be implemented accordingly.

### 3. Register route

Update `client/src/routes.tsx` to include the new route:

```tsx
import FriendsListPage from './pages/FriendsListPage';

// inside your <Routes> definition:
<Route path="/friends-list" element={<FriendsListPage />} />
```

Make sure this import path matches your project structure.

### 4. Add link to sidebar

Update the sidebar component (likely in `client/src/components/Sidebar.tsx`) to include a link to the new page:

```tsx
import { NavLink } from 'react-router-dom';

{/* existing nav items */}
<NavLink to="/friends-list" className="sidebar-item">
  Friends
</NavLink>
```

This will ensure users can navigate to the Friends List page.

### 5. Backend endpoints

If the backend does not already have endpoints to fetch friends and friend requests, implement corresponding endpoints (e.g., `/api/friends` and `/api/friends/requests`) to return data structures compatible with the component's expectations.

## Conclusion

Implementing the above changes will resolve the 404 issue for the Friends List page, provide a functional UI that retrieves and displays friends and pending requests, and integrate navigation across the app. This aligns with MB.MD patterns by introducing graceful loading and empty states, clear routing, and separation of concerns. After code implementation, create Playwright tests to verify the friends list page loads, displays data, handles errors, and integrates seamlessly with other pages.
