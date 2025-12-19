# Code Change Plan

## Friends List Page Implementation

- Create a new file `client/src/pages/FriendsListPage.tsx` to host the friends list UI.
- Fetch both accepted friends and pending requests via new API helpers (`fetchFriends` and `fetchFriendRequests`) to be implemented in `client/src/api/friends.ts`.
- Register a route in the client router (`src/routes.tsx`) for `/friends-list` and add a link to the sidebar so users can navigate there.
- A minimal component skeleton could look like this:

```tsx
import React, { useEffect, useState } from 'react';
import { fetchFriends, fetchFriendRequests } from '../api/friends';

const FriendsListPage: React.FC = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const friendsData = await fetchFriends();
      const requestsData = await fetchFriendRequests();
      setFriends(friendsData);
      setRequests(requestsData);
    }
    loadData();
  }, []);

  return (
    <div>
      <h1>Friends List</h1>
      {/* Render lists of friends and friend requests here */}
    </div>
  );
};

export default FriendsListPage;
```

## Onboarding City Selection Fix

- Identify the onboarding component responsible for city selection, likely in `client/src/pages/onboarding`.
- Ensure that the selected city is passed correctly to the backend when the **Continue** button is clicked. Verify the backend endpoint accepts the payload and returns success.
- Add proper error handling to display a descriptive message if saving the city fails.
- Write a Playwright end‑to‑end test that simulates selecting a city and verifies that the onboarding flow advances.

## PRO Pages Empty States and Pluralization

- Correct the pluralization in search placeholders for each PRO category (e.g., `"performerss"` should be `"performers"`).
- Implement empty‑state components explaining what users can do when no professionals are available (e.g., “No professionals yet. Add this role to your profile or invite others.”).
- Integrate API calls to fetch real professionals for each category once available and render them accordingly.

## Admin Dashboards and Additional Features

- Create admin dashboard pages under `client/src/pages/admin` for tasks such as user management, content moderation, and analytics.
- Restrict access to these pages using RBAC checks so that only authorized admin users can view them.
- Provide UI controls for editing/deleting posts, approving events, and managing user roles.
- Write Playwright tests to cover admin workflows, including creating and editing events, managing users, and verifying that changes propagate across the site.

## Testing and Documentation

- For each new feature, add unit tests and end‑to‑end tests to ensure proper functionality and regression coverage.
- Update or create product requirement documents (PRDs), technical docs, and user guides to reflect the new pages and behaviors.
- Ensure all documentation adheres to the patterns and standards defined in `mb.md`.
