# Events Page QA Audit
## Overview
- The Events & Milongas page aims to help users discover tango events like milongas, workshops, and performances near them.
- A hero section with background image invites users to 'Discover Tango Events' and features a prominent Create Event button.

## Functionality & Navigation
- Tabs allow switching between 'My Events' and 'Upcoming', with a search input and 'Discover' toggle for exploring events beyond the user's own.
- Within 'Events in your city', there are sub tabs: List (default), Calendar, and Map for different event views.
- Event cards in the list view show event image, title, host, date, time, location, and tags such as 'Milonga', 'Workshop', etc. A follow/RSVP button is available.
- The Calendar view displays events in a monthly grid; the Map view plots event locations.
- The Create Event button leads to event creation flow; plus icon floating at bottom right opens quick actions.

## Observations
- ✅ The hero section clearly communicates the purpose and has a call to action.
- ✅ Tabs and view toggles are intuitive and maintain state.
- ✅ Event cards provide necessary details and call to action; list is scrollable.
- ⚠þ For a new user without events, the page may appear empty; there is no friendly message or suggestions.
- ⚠þ Accessibility: Need to ensure keyboard navigation and ARIA labels for tabs and event cards.

## Issues & Recommendations
- **Empty state handling:** If no events are available in the selected city, show a message guiding users to broaden search or create a new event.
- **Search & filters:** Provide filters by date, type, and location to help users narrow results.
- **Accessibility:** Add ARIA roles/labels and ensure elements are reachable by keyboard.
- **Performance:** Implement lazy loading for event cards and optimize map view for slower connections.

## Summary of Fixes & Technical Recommendations
- Implement user‑friendly empty states per MB.MD guidelines, with prompts to explore or create events.
- Add advanced filtering options (date range, event type, proximity) consistent with pattern 32 (data filtering).
- Ensure tab components and buttons follow accessibility standards with ARIA attributes and keyboard navigation.
- Use virtualization or pagination to load events incrementally and cluster markers on map to improve performance.
