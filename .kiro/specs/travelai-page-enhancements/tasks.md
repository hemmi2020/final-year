# Implementation Plan: TravelAI Page Enhancements

## Overview

Implement enhancements across the TravelAI app: generative UI for AI chat questions, map location fix, profile page features (avatar upload, password change, inline editing), forgot/reset password flow, and auth hydration verification. All changes use the existing Next.js + Express + MongoDB stack with the orange theme preserved.

## Tasks

- [ ] 1. Chat Generative UI — QuestionDetector and Interactive Inputs
  - [x] 1.1 Install `react-markdown` dependency in the frontend
    - Run `npm install react-markdown` in `frontend/`
    - _Requirements: 1.7_

  - [x] 1.2 Create the `QuestionDetector` module at `frontend/src/lib/questionDetector.js`
    - Export `detectQuestion(text)` function that returns `{ type, context }` or `null`
    - Implement regex-based keyword matching for 5 question types: destination, duration, budget, preferences, companions
    - Priority order: destination > duration > budget > preferences > companions
    - Use keyword patterns from design: "where"/"destination" for destination, "how long"/"days" for duration, "budget"/"spend" for budget, "interests"/"prefer" for preferences, "traveling with"/"solo"/"companion" for companions
    - Return `null` when no pattern matches
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8_

  - [ ]\* 1.3 Write property test for QuestionDetector classification
    - **Property 1: Question detection classification**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

  - [ ]\* 1.4 Write property test for no false positive detection
    - **Property 2: No false positive question detection**
    - **Validates: Requirements 1.8**

  - [x] 1.5 Create the 5 InteractiveInput components in `frontend/src/components/chat/inputs/`
    - Create `DestinationSearch.jsx` — text input with Mapbox geocoding autocomplete, sends `"I want to go to {city}"` on selection
    - Create `DurationSelector.jsx` — button grid for 1–30 days, sends `"I'd like to travel for {n} days"` on click
    - Create `BudgetSelector.jsx` — three buttons (Budget, Mid-range, Luxury), sends `"My budget preference is {level}"` on click
    - Create `PreferenceChips.jsx` — multi-select chips (Halal Food, Beach, History, Shopping, Nature, Culture, Family, Adventure) with confirm button, sends `"I'm interested in {selections}"`
    - Create `CompanionSelector.jsx` — four buttons (Solo, Couple, Family, Friends), sends `"I'll be traveling {choice}"` on click
    - Each component receives `onSend` callback prop and auto-composes the answer string
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]\* 1.6 Write property test for interactive input message composition
    - **Property 3: Interactive input message composition**
    - **Validates: Requirements 1.6**

  - [x] 1.7 Enhance `MessageRenderer` in `frontend/src/components/chat/GenerativeUI.jsx`
    - Import and use `react-markdown` to render text blocks instead of raw `<p>` tags
    - Import `detectQuestion` from `questionDetector.js`
    - For each text block, run `detectQuestion()` — if a question is detected, render the corresponding InteractiveInput component below the markdown text
    - Pass `onSendMessage` as the `onSend` prop to InteractiveInput components
    - Keep existing `<component>` tag parsing unchanged — question detection only applies to text blocks
    - Strip any residual markdown artifacts that react-markdown doesn't handle
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 2. Checkpoint — Chat generative UI
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Map Location Fix — GlobeMap centering and zoom levels
  - [x] 3.1 Enhance `extractDestinationFromText` in `frontend/src/lib/extractDestination.js`
    - Modify the return object to include `placeType` from the Mapbox geocoding response `place_type` field
    - Return `{ name, lat, lng, placeType }` where placeType is `"place"`, `"region"`, or `"country"`
    - _Requirements: 2.4, 2.5_

  - [x] 3.2 Update `GlobeMap` in `frontend/src/components/map/GlobeMap.jsx`
    - Accept a new `userLocation` prop `{ lat, lng }`
    - On initial load (no destination), center map on `userLocation` instead of hardcoded Istanbul `[28.97, 41.01]`
    - If `userLocation` is null/undefined, fall back to `[0, 20]` zoom 2
    - Update the `flyTo` effect to use zoom levels based on `destination.placeType`: city (`place`) → zoom 11, country → zoom 5, default → zoom 8
    - Keep existing marker, amenity, and rotation logic intact
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.3 Wire user location into Chat page at `frontend/src/app/chat/page.jsx`
    - Use IP geolocation (or the existing `useLocation` hook if available) to get user coordinates
    - Pass `userLocation` prop to `<GlobeMap>`
    - Handle geolocation failure gracefully (pass `null` so GlobeMap falls back to world view)
    - _Requirements: 2.1, 2.6_

- [ ] 4. Profile Avatar Upload
  - [x] 4.1 Create `AvatarUploader` component at `frontend/src/components/profile/AvatarUploader.jsx`
    - Render a clickable avatar area with a camera icon overlay on hover
    - Use a hidden `<input type="file" accept="image/jpeg,image/png,image/webp" />`
    - On file select: validate file size ≤ 2 MB, read as base64 via `FileReader`, show preview
    - If file > 2 MB, show inline error "Image must be under 2 MB" and reject
    - On confirm: call `POST /api/users/avatar` with `{ avatar: base64String }`
    - On success: call `onUpload` callback so parent can update Auth_Store
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]\* 4.2 Write property test for avatar file size validation
    - **Property 4: Avatar file size validation**
    - **Validates: Requirements 3.5**

  - [x] 4.3 Integrate `AvatarUploader` into the Profile page at `frontend/src/app/profile/page.jsx`
    - Replace the static avatar initial div with `<AvatarUploader>` in the profile header area
    - On successful upload, update Auth_Store via `updateUser({ avatar })`
    - Update the `usersAPI.uploadAvatar` call in `frontend/src/lib/api.js` to send JSON `{ avatar: base64String }` instead of multipart form data (matching the existing backend endpoint)
    - _Requirements: 3.3, 3.6_

- [ ] 5. Profile Password Change
  - [x] 5.1 Add `changePassword` backend endpoint
    - Add `exports.changePassword` to `backend/controllers/userController.js`
    - Fetch user with `select('+password')`, call `user.comparePassword(currentPassword)` — return 401 "Current password is incorrect" if false
    - Set `user.password = newPassword` (pre-save hook hashes it), call `user.save()`
    - Return success response
    - Add route `router.put('/change-password', changePassword)` in `backend/routes/users.js`
    - _Requirements: 4.4, 4.5, 4.6_

  - [x] 5.2 Add `changePassword` API method to `frontend/src/lib/api.js`
    - Add `changePassword: (data) => api.put('/api/users/change-password', data)` to `usersAPI`
    - _Requirements: 4.4_

  - [x] 5.3 Create `PasswordChanger` component at `frontend/src/components/profile/PasswordChanger.jsx`
    - Accept `isOAuthUser` prop — if true, show info message "Password management is not available for social login accounts" and hide form
    - Render form with currentPassword, newPassword, confirmPassword fields
    - Client-side validation: newPassword ≥ 8 chars, newPassword === confirmPassword
    - On submit: call `usersAPI.changePassword({ currentPassword, newPassword })`
    - On success: show success message, clear form fields
    - On 401 error: show "Current password is incorrect"
    - _Requirements: 4.1, 4.2, 4.3, 4.7, 4.8_

  - [ ]\* 5.4 Write property test for password change form validation
    - **Property 5: Password change form validation**
    - **Validates: Requirements 4.2, 4.3**

  - [ ]\* 5.5 Write property test for backend current password verification
    - **Property 6: Backend current password verification**
    - **Validates: Requirements 4.5, 4.6**

  - [x] 5.6 Integrate `PasswordChanger` into the Profile page Settings tab
    - Add `<PasswordChanger>` below the existing Personal Information section in the Settings tab of `frontend/src/app/profile/page.jsx`
    - Pass `isOAuthUser` prop based on profile data (e.g., `!profile?.password && profile?.googleId`)
    - _Requirements: 4.1, 4.8_

- [ ] 6. Checkpoint — Profile avatar and password change
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Profile Inline Editing
  - [x] 7.1 Update User model schema at `backend/models/User.js`
    - Add `bio: { type: String, maxlength: 200, default: '' }` field
    - Add `phone: { type: String, default: '' }` field
    - Add `resetPasswordToken: { type: String }` field (needed for Requirement 6)
    - Add `resetPasswordExpires: { type: Date }` field (needed for Requirement 6)
    - Add `googleId: { type: String }` field if not already present
    - _Requirements: 5.6, 6.8_

  - [x] 7.2 Update `updateProfile` handler in `backend/controllers/userController.js`
    - Accept and persist `bio` and `phone` fields in addition to existing `name` and `avatar`
    - _Requirements: 5.5_

  - [x] 7.3 Implement inline editing on the Profile page at `frontend/src/app/profile/page.jsx`
    - Add `editMode` state boolean and `originalValues` state snapshot
    - When user clicks "Edit Profile" button, enter edit mode: capture current name/bio/phone as `originalValues`, render fields as `<input>` elements
    - Show Save and Cancel buttons in place of Edit Profile button while in edit mode
    - Save: call `usersAPI.updateProfile({ name, bio, phone })`, then `updateUser()` on Auth_Store, exit edit mode
    - Cancel: revert all fields to `originalValues`, exit edit mode
    - Display bio and phone fields in the profile info area (read-only when not editing)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 7.4 Write property test for edit cancel reverts state
    - **Property 7: Edit cancel reverts state**
    - **Validates: Requirements 5.4**

- [ ] 8. Forgot Password and Reset Password Flow
  - [x] 8.1 Add `sendPasswordResetEmail` function to `backend/services/emailService.js`
    - Create an HTML email template with a reset link pointing to `{FRONTEND_URL}/reset-password?token={token}`
    - Send via Brevo API (same pattern as existing `sendVerificationEmail`)
    - _Requirements: 6.2_

  - [x] 8.2 Add `forgotPassword` and `resetPassword` endpoints to `backend/controllers/authController.js`
    - `forgotPassword`: find user by email, generate token via `crypto.randomBytes(32).toString('hex')`, store SHA-256 hash as `resetPasswordToken` with 1-hour expiry on user, send reset email, return uniform success response regardless of whether email exists
    - `resetPassword`: hash incoming token with SHA-256, find user with matching token and non-expired `resetPasswordExpires`, set new password (pre-save hook hashes), clear token fields, return success. Return 400 for invalid/expired tokens.
    - _Requirements: 6.2, 6.3, 6.6, 6.7_

  - [ ]\* 8.3 Write property test for forgot-password token security
    - **Property 8: Forgot-password token security**
    - **Validates: Requirements 6.2**

  - [ ]\* 8.4 Write property test for forgot-password response uniformity
    - **Property 9: Forgot-password response uniformity**
    - **Validates: Requirements 6.3**

  - [ ]\* 8.5 Write property test for reset-password token validation
    - **Property 10: Reset-password token validation and update**
    - **Validates: Requirements 6.6, 6.7**

  - [x] 8.6 Add routes for forgot-password and reset-password in `backend/routes/auth.js`
    - `router.post('/forgot-password', authLimiter, forgotPassword)`
    - `router.post('/reset-password', authLimiter, resetPassword)`
    - _Requirements: 6.1, 6.5_

  - [x] 8.7 Add API methods to `frontend/src/lib/api.js`
    - Add `forgotPassword: (email) => api.post('/api/auth/forgot-password', { email })` to `authAPI`
    - Add `resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password })` to `authAPI`
    - _Requirements: 6.1, 6.5_

  - [x] 8.8 Wire `ForgotPassword` page at `frontend/src/app/forgot-password/page.jsx` to real API
    - Replace the `setTimeout` mock in `handleSubmit` with a real call to `authAPI.forgotPassword(email)`
    - On success: show the existing "Check your email" confirmation UI
    - On error: show an inline error message
    - _Requirements: 6.1, 6.9_

  - [x] 8.9 Create `ResetPassword` page at `frontend/src/app/reset-password/page.jsx`
    - Read `token` from URL `searchParams`
    - Render form with newPassword and confirmPassword fields
    - Client validation: ≥ 8 chars, passwords match
    - On submit: call `authAPI.resetPassword(token, password)`
    - On success: show success message with link to login
    - On error: show error message (token invalid/expired) with link to request new reset
    - _Requirements: 6.4, 6.5_

- [ ] 9. Checkpoint — Forgot/reset password flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Auth Hydration Verification
  - [x] 10.1 Verify auth hydration fix is in place
    - Confirm `Auth_Store` in `frontend/src/store/authStore.js` has `hasHydrated` flag with `onRehydrateStorage` callback (already present)
    - Confirm `Navigation` component renders a placeholder when `!hasHydrated` (already implemented)
    - No code changes needed — add a comment or note confirming verification
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The existing orange theme, navbar, and all other working features remain unchanged
- Auth hydration (Requirement 7) is already implemented — task 10.1 is verification only
