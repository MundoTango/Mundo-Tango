# Feature Analysis and Code Recommendations  

This document captures ongoing research and preliminary code recommendations derived from exploring the Mundo Tango repository in response to the MB.MD orchestration plan. It complements the existing audits and plans by mapping identified issues to specific code modules and suggesting high-level changes.  

## Friends List Page  

### Observed Gap  
- The `/friends-list` route returns a 404 for standard users, indicating that there is no page implemented for managing friends.  

### Proposed Solution  
- Create a new page component under `client/src/pages/FriendsListPage.tsx` (or .jsx depending on project conventions).  
- The component should:  
  - Fetch the current user's friends and pending friend requests from the backend (e.g., via a `GET /api/friends` endpoint).  
  - Display existing friends in a list or grid with options to message or view profiles.  
  - Show pending friend requests with controls to accept or decline.  
  - Offer a search/input field to invite or search for new friends.  
- Register the new route in the client router configuration (`client/src/router.tsx` or similar) to map `/friends-list` to the FriendsListPage component.  
- Update navigation (sidebar) to ensure the link points to the new page and is visible based on RBAC.  

### Example Component Skeleton (TypeScript/React)  
```
import React, { useEffect, useState } from 'react';
import { fetchFriends, fetchFriendRequests } from '../api/friends';

const FriendsListPage: React.FC = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

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
    <div className="friends-list-page">
      <h1>Your Friends</h1>
      {/* Friends list */}
      <section>
        {friends.length === 0 ? (
          <p>You have no friends yet.</p>
        ) : (
          friends.map(friend => (
            <div key={friend.id} className="friend-card">
              <span>{friend.name}</span>
              {/* actions like message/view */}
            </div>
          ))
        )}
      </section>
      {/* Pending requests */}
      <section>
        <h2>Pending Requests</h2>
        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          requests.map(req => (
            <div key={req.id} className="request-card">
              <span>{req.senderName}</span>
              {/* accept/decline buttons */}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default FriendsListPage;
```
- The API helpers (`fetchFriends` and `fetchFriendRequests`) would be implemented in `client/src/api/friends.ts` to call backend endpoints.  

## Onboarding City Selection Bug  

### Observed Issue  
- In the city selection step of onboarding, clicking “Continue” triggers a generic error and does not progress, even after selecting a city.  

### Proposed Investigation & Fix  
- Locate the onboarding step component (likely in `client/src/pages/onboarding`).  
- Check the handler for the “Continue” button; ensure it properly passes the selected city to the API.  
- Verify the backend endpoint that stores the city selection; ensure it accepts the payload and returns success.  
- Implement error handling to display descriptive error messages when the city cannot be saved.  
- Add E2E tests (Playwright) to simulate city selection and confirm the onboarding flow progresses as expected.  

## PRO Pages Empty States and Pluralization  

### Observed Issue  
- PRO category pages show zero professionals and have search placeholders with incorrect pluralization (e.g., "performerss").  

### Proposed Fix  
- Update the placeholder strings in each PRO page component to correct the pluralization.  
- Add empty-state components that explain what the user can do (e.g., “No professionals yet. Add this role to your profile or invite others.”).  
- Fetch data from the backend for these categories, if available, and render professionals accordingly.  

## Next Steps  

- Continue exploring `client/src` to identify other missing pages and components (e.g., admin dashboards).  
- For each identified feature gap, document the expected behavior, file locations, and provide code skeletons or pseudocode.  
- Collaborate with backend developers to define necessary API endpoints for friends, onboarding, PRO categories, etc.  
- Expand Playwright test suite to cover new pages and scenarios as they are implemented.
