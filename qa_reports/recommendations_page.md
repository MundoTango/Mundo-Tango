# Recommendations Page Audit  

## Overview  
- The Recommendations page provides AI-powered suggestions tailored to a user's tango journey. It features a hero banner labeled "Curated For You" with the title "Your Recommendations".  
- A "Discover What's Next" section introduces the content, and there is a **Refresh** button to update recommendations.  

## Observations  
- Metrics displayed include **New Today**, **Match Score**, **Acted On**, and **Saved**. For a new user, all values are zero.  
- The page currently shows no recommendation items, likely because the user has not interacted enough with the platform.  
- The sidebar still provides quick navigation to other sections (social, community, PRO discovery).  
- There is no guidance or call‑to‑action when no recommendations are available.  

## Issues & Recommendations  
- **Empty state messaging:** Provide a friendly message explaining that recommendations will appear once the user engages with memories, events, or groups. Suggest actions to generate data (e.g., follow users, attend events).  
- **Personalization controls:** Allow users to refine recommendations by indicating interests, preferred dance styles, or locations. Provide filters or categories (memories, events, groups).  
- **Feedback loop:** Offer options to act on a recommendation (save, dismiss, indicate disinterest) and feed this back into the AI model.  
- **Cross-page integration:** Ensure that recommended events, groups, or posts link directly to their respective pages. Actions taken (like saving or acting on recommendations) should update counts and appear in the user’s feed or events list.  
- **Performance:** When there are many recommendations, implement lazy loading or pagination to maintain page performance.  

## Summary for Mr Blue AI & Subagents  
- Build a robust recommendations engine that leverages user data (roles, location, interests) following MB.MD patterns for AI-driven suggestions.  
- Implement clear empty state guidance and encourage user engagement to improve recommendation quality.  
- Integrate recommendation actions with other pages: saving, acting on, or dismissing a recommendation should update the feed, events, and groups data consistently.  
- Provide UI controls for users to influence their recommendations and incorporate a feedback loop to fine-tune the AI model. 
