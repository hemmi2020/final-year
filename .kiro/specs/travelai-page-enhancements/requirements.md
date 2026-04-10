# Requirements Document

## Introduction

This specification covers enhancements to multiple pages in the TravelAI Next.js application. The scope includes: (1) generative UI for AI chat questions with interactive input components, (2) fixing the map to center on user/destination location instead of a random default, (3) redesigning the profile page with avatar upload, password change, and inline editing, (4) wiring the forgot-password flow to real backend endpoints and adding a reset-password page, and (5) verifying the auth hydration flicker fix already in place. The existing orange color theme, navbar design, and all other working features remain unchanged.

## Glossary

- **Chat_Page**: The AI chat interface at `/chat` where users converse with the AI travel assistant to plan trips (`frontend/src/app/chat/page.jsx`)
- **MessageRenderer**: The component that parses AI responses and renders text or interactive UI components (`frontend/src/components/chat/GenerativeUI.jsx`)
- **QuestionDetector**: A new parsing module that inspects AI response text and identifies when the AI is asking the user a trip-planning question (destination, duration, budget, preferences, companions)
- **InteractiveInput**: A collective term for the generative UI widgets rendered in place of raw text questions — includes DestinationSearch, DurationSelector, BudgetSelector, PreferenceChips, and CompanionSelector
- **GlobeMap**: The Mapbox-powered map component displayed on the right panel of the Chat_Page (`frontend/src/components/map/GlobeMap.jsx`)
- **Profile_Page**: The user profile page at `/profile` with tabs for trips, settings, and preferences (`frontend/src/app/profile/page.jsx`)
- **AvatarUploader**: A new component that allows the user to click their avatar, pick an image file, preview it, and upload it
- **PasswordChanger**: A new section in the Profile_Page Settings tab for changing the user's password
- **ForgotPassword_Page**: The existing page at `/forgot-password` that currently uses a mock setTimeout flow (`frontend/src/app/forgot-password/page.jsx`)
- **ResetPassword_Page**: A new page at `/reset-password` that accepts a token query parameter and allows the user to set a new password
- **Auth_Controller**: The backend controller handling authentication endpoints (`backend/controllers/authController.js`)
- **User_Controller**: The backend controller handling user profile endpoints (`backend/controllers/userController.js`)
- **User_Model**: The Mongoose model for users, storing credentials, profile, and preferences (`backend/models/User.js`)
- **Auth_Store**: The Zustand store managing authentication state on the frontend, including the `hasHydrated` flag (`frontend/src/store/authStore.js`)
- **Navigation**: The top navbar component that gates rendering on `hasHydrated` (`frontend/src/components/layout/Navigation.jsx`)

## Requirements

### Requirement 1: Detect AI Questions and Render Interactive Input Components

**User Story:** As a traveler using the AI chat, I want the AI's questions to appear as interactive UI widgets instead of raw text, so that I can answer quickly by tapping buttons or selecting options.

#### Acceptance Criteria

1. WHEN the AI response contains a question about the travel destination, THE QuestionDetector SHALL identify the question and THE MessageRenderer SHALL render a DestinationSearch component with a text input supporting autocomplete via Mapbox geocoding
2. WHEN the AI response contains a question about trip duration, THE QuestionDetector SHALL identify the question and THE MessageRenderer SHALL render a DurationSelector component with selectable day buttons ranging from 1 to 30
3. WHEN the AI response contains a question about budget, THE QuestionDetector SHALL identify the question and THE MessageRenderer SHALL render a BudgetSelector component with three option buttons: Budget, Mid-range, and Luxury
4. WHEN the AI response contains a question about travel preferences or interests, THE QuestionDetector SHALL identify the question and THE MessageRenderer SHALL render a PreferenceChips component with multi-select chip buttons including Halal Food, Beach, History, Shopping, Nature, Culture, Family, and Adventure
5. WHEN the AI response contains a question about travel companions, THE QuestionDetector SHALL identify the question and THE MessageRenderer SHALL render a CompanionSelector component with option buttons: Solo, Couple, Family, and Friends
6. WHEN the user makes a selection on any InteractiveInput component, THE InteractiveInput SHALL auto-compose an answer text from the selection and send the composed message to the AI via the existing sendMessage function
7. THE MessageRenderer SHALL strip markdown symbols from AI response text and render formatted content using the react-markdown library
8. WHEN the AI response contains no detectable question, THE MessageRenderer SHALL render the response as formatted text without any InteractiveInput components

### Requirement 2: Center Map on User Location and Fly to Destination

**User Story:** As a traveler, I want the map to show my current location when I open the chat page and fly to the destination city when I select one, so that the map is always contextually relevant.

#### Acceptance Criteria

1. WHEN the Chat_Page loads and no destination has been selected, THE GlobeMap SHALL center on the user's location detected via IP geolocation
2. WHEN the user selects a destination city through the chat conversation, THE GlobeMap SHALL use the Mapbox flyTo animation to move the map view to the destination city coordinates
3. WHEN the GlobeMap flies to a destination city, THE GlobeMap SHALL display a marker on the destination city location
4. WHEN the GlobeMap flies to a city-level destination, THE GlobeMap SHALL set the zoom level to 11
5. WHEN the GlobeMap flies to a country-level destination, THE GlobeMap SHALL set the zoom level to 5
6. IF IP geolocation fails or returns no result, THEN THE GlobeMap SHALL fall back to a default world view centered at coordinates [0, 20] with zoom level 2

### Requirement 3: Profile Page Avatar Upload

**User Story:** As a user, I want to upload a profile picture by clicking my avatar, so that my profile has a personalized photo.

#### Acceptance Criteria

1. WHEN the user clicks the avatar area on the Profile_Page, THE AvatarUploader SHALL open a file picker dialog accepting image files (JPEG, PNG, WebP)
2. WHEN the user selects an image file, THE AvatarUploader SHALL display a preview of the selected image in the avatar area before uploading
3. WHEN the user confirms the image selection, THE AvatarUploader SHALL convert the image to a base64 string and send it to the backend via POST /api/users/avatar
4. WHEN the backend receives the avatar data, THE User_Controller SHALL store the avatar value and return the updated user object
5. IF the selected file exceeds 2 MB in size, THEN THE AvatarUploader SHALL display an error message "Image must be under 2 MB" and reject the file
6. WHEN the avatar upload succeeds, THE Profile_Page SHALL update the displayed avatar and sync the change to the Auth_Store

### Requirement 4: Profile Page Password Change

**User Story:** As a user, I want to change my password from the profile settings tab, so that I can keep my account secure.

#### Acceptance Criteria

1. THE PasswordChanger SHALL render in the Settings tab of the Profile_Page with fields for current password, new password, and confirm new password
2. WHEN the user submits the password change form, THE PasswordChanger SHALL validate that the new password is at least 8 characters long
3. WHEN the user submits the password change form, THE PasswordChanger SHALL validate that the new password and confirm password fields match
4. WHEN validation passes, THE PasswordChanger SHALL send a PUT request to a new backend endpoint PUT /api/users/change-password with the current password and new password
5. WHEN the backend receives the change-password request, THE User_Controller SHALL verify the current password matches the stored hash before updating
6. IF the current password does not match, THEN THE User_Controller SHALL return a 401 error with message "Current password is incorrect"
7. WHEN the password change succeeds, THE PasswordChanger SHALL display a success message and clear the form fields
8. WHILE the user is authenticated via Google OAuth (no password set), THE PasswordChanger SHALL display the message "Password management is not available for social login accounts" and hide the password form fields

### Requirement 5: Profile Page Inline Editing

**User Story:** As a user, I want to edit my name, bio, and phone number directly on my profile page, so that I can update my information without navigating away.

#### Acceptance Criteria

1. WHEN the user clicks the Edit Profile button, THE Profile_Page SHALL switch the name, bio, and phone fields to editable input mode
2. WHILE the Profile_Page is in edit mode, THE Profile_Page SHALL display Save and Cancel buttons in place of the Edit Profile button
3. WHEN the user clicks Save, THE Profile_Page SHALL send the updated fields to PUT /api/users/profile and update the Auth_Store with the new values
4. WHEN the user clicks Cancel, THE Profile_Page SHALL revert all fields to their previous values and exit edit mode
5. THE User_Controller updateProfile handler SHALL accept and persist the bio and phone fields in addition to the existing name and avatar fields
6. THE User_Model SHALL include optional bio (String, max 200 characters) and phone (String) fields in the schema

### Requirement 6: Forgot Password Backend Endpoints and Frontend Wiring

**User Story:** As a user who forgot my password, I want to request a password reset email and set a new password via a reset link, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN the user submits the forgot-password form, THE ForgotPassword_Page SHALL send a POST request to /api/auth/forgot-password with the email address
2. WHEN the Auth_Controller receives a forgot-password request for a registered email, THE Auth_Controller SHALL generate a secure random reset token, store the hashed token and expiry (1 hour) on the User_Model, and send a password reset email containing a link to /reset-password?token=TOKEN
3. WHEN the Auth_Controller receives a forgot-password request for an unregistered email, THE Auth_Controller SHALL return a success response without revealing that the email is not registered (to prevent email enumeration)
4. THE ResetPassword_Page SHALL render at /reset-password with fields for new password and confirm password, reading the token from the URL query parameter
5. WHEN the user submits the reset-password form, THE ResetPassword_Page SHALL send a POST request to /api/auth/reset-password with the token and new password
6. WHEN the Auth_Controller receives a valid reset-password request, THE Auth_Controller SHALL verify the token has not expired, hash the new password, update the user record, clear the reset token fields, and return a success response
7. IF the reset token is invalid or expired, THEN THE Auth_Controller SHALL return a 400 error with message "Reset token is invalid or has expired"
8. THE User_Model SHALL include resetPasswordToken (String) and resetPasswordExpires (Date) fields to support the password reset flow
9. THE ForgotPassword_Page SHALL replace the existing setTimeout mock with the real API call to POST /api/auth/forgot-password

### Requirement 7: Verify Auth Hydration Flicker Fix

**User Story:** As a user, I want the navigation bar to not flicker between logged-in and logged-out states on page load, so that the experience feels polished.

#### Acceptance Criteria

1. THE Auth_Store SHALL expose a hasHydrated flag that is set to true only after Zustand rehydration completes
2. WHILE hasHydrated is false, THE Navigation SHALL render a placeholder element in place of the user avatar button to prevent layout shift
3. WHEN hasHydrated becomes true, THE Navigation SHALL render the correct authentication state (logged-in avatar or guest icon) without a visible flicker
