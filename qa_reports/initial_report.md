# QA Checklist for Mundo Tango Login to Feed  

## Login Page  
- Clear header navigation and CTA to login: ✅  
- Well‑labeled email & password fields with placeholders: ✅  
- Invalid login feedback missing: ⚠️ Add inline or toast error message on failed login.  
- Links for “Forgot password?” and “Create one now” present: ✅  
- Replit banner overlap: ⚠️ Hide or reposition banner on critical pages.  

## Registration Page  
- Fields for name, email, username, password, confirm password: ✅  
- Real‑time validation for email/username availability and password strength/match: ✅  
- Terms & Conditions checkbox required: ✅  
- Username taken suggestion not automatically applied: ⚠️ Auto‑fill suggested username or make clear that user must update.  
- Successful submission redirects to onboarding: ✅  

## Onboarding Welcome  
- Presents steps overview with single “Let’s Get Started” button: ✅  
- Banner interference from Replit: ⚠️ Ensure banner closes or does not overlap CTA.  
- No skip option: ⚠️ Provide a “Skip onboarding” or “Finish later” link.  

## Onboarding Step 1 (City Selection)  
- Search field to find a city: ✅  
- Back and Continue buttons appear after selection: ✅  
- Continue button error: ⚠️ Fix submission logic; provide clear error messages.  
- No progress enforcement: ⚠️ Enforce completion or allow skipping gracefully.  

## Memory Feed  
- Quote banner with navigation tabs (Following / Discover): ✅  
- Memory composer, upcoming events sidebar, navigation drawer present: ✅  
- Logout button works and returns to login page: ✅  
- Empty state guidance: ⚠️ Offer suggested accounts or prompt to finish onboarding.
