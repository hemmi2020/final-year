# Implementation Plan: Frontend UI Setup

## Overview

This implementation plan breaks down the frontend UI setup into discrete, actionable coding tasks. The plan follows a bottom-up approach: foundation → theme system → UI components → layout components → feature components → landing page assembly → testing → optimization. Each task builds incrementally on previous work, ensuring the application remains functional at every step.

The implementation uses Next.js 16 with App Router, React 19, and Tailwind CSS v4. All components will be built with accessibility, responsiveness, and performance in mind.

## Tasks

- [x] 1. Initialize Next.js project and configure Tailwind CSS v4
  - Create new Next.js 16 project with App Router
  - Install Tailwind CSS v4 and configure PostCSS
  - Set up project directory structure (src/app, src/components, src/lib, src/hooks)
  - Create initial package.json with all required dependencies
  - _Requirements: 12.1, 12.2, 19.1, 19.2_

- [x] 2. Create theme system with CSS custom properties
  - [x] 2.1 Create globals.css with all CSS custom properties
    - Define primary color scale (50-900 shades) using RGB values
    - Define secondary color scale (teal, 50-900 shades)
    - Define accent color scale (amber, 50-900 shades)
    - Define neutral color scale (gray, 50-900 shades)
    - Define semantic colors (success, warning, error, info)
    - Define spacing scale, border radius, transitions, z-index values
    - Add base styles for body, focus states, and reduced motion support
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_

  - [x] 2.2 Configure Tailwind v4 inline theme with @theme directive
    - Create @theme block referencing CSS custom properties
    - Configure color mappings to CSS variables
    - Configure breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
    - Configure font families, sizes, and spacing
    - _Requirements: 1.6, 13.2, 14.2_

  - [ ]\* 2.3 Write property test for color palette completeness
    - **Property 1: Color Palette Completeness**
    - **Validates: Requirements 1.7**

  - [ ]\* 2.4 Write property test for color contrast compliance
    - **Property 26: Color Contrast Compliance**
    - **Validates: Requirements 17.2**

- [x] 3. Set up root layout with fonts and metadata
  - [x] 3.1 Create app/layout.js with root HTML structure
    - Configure Inter font from next/font/google
    - Set up HTML lang attribute and font variable
    - Apply globals.css import
    - Add metadata for SEO (title, description, viewport)
    - _Requirements: 12.3, 12.4, 12.5, 12.6, 14.1_

  - [x] 3.2 Configure typography system in globals.css
    - Define heading styles (h1-h6) with font sizes and weights
    - Define body text styles with line heights
    - Add text rendering optimizations (antialiasing, font-feature-settings)
    - _Requirements: 14.3, 14.4, 14.5, 14.6_

  - [ ]\* 3.3 Write property test for mobile text minimum size
    - **Property 17: Mobile Text Minimum Size**
    - **Validates: Requirements 14.7**

- [x] 4. Create utility functions and constants
  - Create lib/utils.js with className merging utility (cn function)
  - Create lib/constants.js with app-wide constants
  - _Requirements: 19.1_

- [x] 5. Implement core UI components - Button
  - [x] 5.1 Create Button component with all variants
    - Implement primary, secondary, outline, and ghost variants
    - Implement size variants (sm, md, lg)
    - Add disabled, loading, and fullWidth props
    - Add hover, active, and focus states with transitions
    - Use semantic button element with proper type attribute
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 17.5_

  - [ ]\* 5.2 Write property test for button size variant support
    - **Property 4: Button Size Variant Support**
    - **Validates: Requirements 8.5**

  - [ ]\* 5.3 Write property test for button disabled state styling
    - **Property 5: Button Disabled State Styling**
    - **Validates: Requirements 8.6**

  - [ ]\* 5.4 Write unit tests for Button component
    - Test all variant combinations render correctly
    - Test onClick handler is called
    - Test disabled state prevents interaction
    - Test loading state displays spinner
    - Test keyboard accessibility (Enter and Space keys)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 6. Implement core UI components - Card
  - [-] 6.1 Create Card component with sub-components
    - Implement base Card with variant support (default, elevated, outlined)
    - Implement CardHeader, CardBody, CardFooter sub-components
    - Implement CardImage with proper aspect ratio handling
    - Add hoverable prop for interactive cards
    - Add padding variants (none, sm, md, lg)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 9.7_

  - [ ]\* 6.2 Write property test for card image positioning
    - **Property 6: Card Image Positioning**
    - **Validates: Requirements 9.4**

  - [ ]\* 6.3 Write property test for interactive card hover effects
    - **Property 7: Interactive Card Hover Effects**
    - **Validates: Requirements 9.5**

  - [ ]\* 6.4 Write unit tests for Card component
    - Test all variants render correctly
    - Test sub-components render in correct order
    - Test hoverable prop applies hover effects
    - Test image maintains aspect ratio
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 7. Implement core UI components - Form inputs
  - [x] 7.1 Create Input component
    - Implement text, email, password, number, tel, url input types
    - Add label, placeholder, error, helperText props
    - Add disabled and required state support
    - Implement error styling with error theme color
    - Implement focus ring with primary theme color
    - Associate label with input using htmlFor/id
    - _Requirements: 10.1, 10.6, 10.7, 10.8, 10.9, 10.10, 17.7_

  - [x] 7.2 Create Textarea component
    - Implement multi-line text input with label support
    - Add error, disabled, and placeholder support
    - Ensure consistent styling with Input component
    - _Requirements: 10.2, 10.6, 10.7, 10.8, 10.9, 10.10_

  - [x] 7.3 Create Select component
    - Implement dropdown select with label support
    - Add error, disabled, and placeholder support
    - Ensure consistent styling with other form components
    - _Requirements: 10.3, 10.6, 10.7, 10.8, 10.10_

  - [x] 7.4 Create Checkbox component
    - Implement checkbox with label support
    - Add disabled state support
    - Ensure minimum touch target size (44x44px)
    - _Requirements: 10.4, 10.10, 13.6_

  - [x] 7.5 Create Radio component
    - Implement radio button with label support
    - Add disabled state support
    - Ensure minimum touch target size (44x44px)
    - _Requirements: 10.5, 10.10, 13.6_

  - [ ]\* 7.6 Write property tests for input components
    - **Property 8: Input Error State Styling**
    - **Property 9: Input Focus State Styling**
    - **Property 10: Input Placeholder Support**
    - **Property 11: Input Disabled State Support**
    - **Validates: Requirements 10.6, 10.7, 10.8, 10.9, 10.10**

  - [ ]\* 7.7 Write unit tests for form input components
    - Test all input types render correctly
    - Test error messages display below inputs
    - Test focus ring appears on focus
    - Test disabled state prevents interaction
    - Test label association with inputs
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

- [x] 8. Implement Modal component
  - [x] 8.1 Create Modal component with backdrop and content
    - Implement modal overlay with semi-transparent backdrop
    - Implement modal content with header, body, footer sections
    - Add size variants (sm, md, lg, xl, full)
    - Implement close button in header
    - Add closeOnBackdrop and closeOnEscape props
    - Prevent background scrolling when modal is open
    - Implement fade-in/scale-in animations (300ms)
    - Trap focus within modal when open
    - Move focus to first focusable element on open
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 17.8, 17.9_

  - [ ]\* 8.2 Write property tests for modal component
    - **Property 12: Modal Backdrop Display**
    - **Property 13: Modal Scroll Prevention**
    - **Property 14: Modal Backdrop Click Handling**
    - **Property 15: Modal Escape Key Handling**
    - **Property 32: Modal Focus Trapping**
    - **Property 33: Modal Focus Management**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5, 17.8, 17.9**

  - [ ]\* 8.3 Write unit tests for Modal component
    - Test modal opens and closes correctly
    - Test backdrop click closes modal
    - Test Escape key closes modal
    - Test background scroll is prevented
    - Test focus trap works correctly
    - Test animations complete within 300ms
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [ ] 9. Checkpoint - Verify UI components are functional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create layout components - Container
  - [x] 10.1 Create Container component
    - Implement responsive max-width container
    - Add responsive padding (px-4 sm:px-6 lg:px-8)
    - Set max-width to 1280px (max-w-7xl)
    - Center container with mx-auto
    - _Requirements: 12.7, 13.3, 13.4, 13.5_

- [x] 11. Create layout components - Navigation
  - [x] 11.1 Create Navigation component with desktop and mobile layouts
    - Implement fixed navigation bar at top
    - Add logo/brand name display
    - Add horizontal navigation links for desktop (hidden on mobile)
    - Add user menu/sign-in button
    - Add hamburger menu button for mobile (hidden on desktop)
    - Implement glassmorphism effect (bg-white/80 backdrop-blur-md)
    - Add border-bottom for visual separation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_

  - [x] 11.2 Implement mobile menu overlay
    - Create slide-in mobile menu overlay
    - Display navigation links vertically in mobile menu
    - Add close button for mobile menu
    - Implement slide-in animation (300ms)
    - Show mobile menu when hamburger is clicked
    - _Requirements: 6.5_

  - [x] 11.3 Add scroll behavior to navigation
    - Detect scroll position using useScrollPosition hook
    - Add shadow to navigation when scrolled beyond 50px
    - Ensure smooth transition for shadow appearance
    - _Requirements: 6.8_

  - [ ]\* 11.4 Write property tests for navigation component
    - **Property 27: Keyboard Navigation Support**
    - **Property 28: Focus Indicator Visibility**
    - **Property 29: Semantic HTML Usage**
    - **Validates: Requirements 17.3, 17.4, 17.5**

  - [ ]\* 11.5 Write unit tests for Navigation component
    - Test navigation renders logo and links
    - Test hamburger menu appears on mobile viewport
    - Test mobile menu opens and closes
    - Test horizontal links appear on desktop viewport
    - Test shadow appears after scrolling 50px
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 12. Create layout components - Footer
  - [x] 12.1 Create Footer component
    - Implement footer with dark background (bg-neutral-900)
    - Create FooterColumn sub-component for link groups
    - Add 4 footer columns (Product, Company, Resources, Legal)
    - Add social media links section
    - Add copyright information
    - Implement responsive grid (1 column mobile, 4 columns desktop)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]\* 12.2 Write unit tests for Footer component
    - Test footer renders all link groups
    - Test footer renders social links
    - Test footer renders copyright
    - Test responsive layout changes at breakpoints
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 13. Update root layout to include Navigation and Footer
  - Import Navigation and Footer components
  - Add Navigation before page content
  - Add Footer after page content
  - Ensure proper spacing between sections
  - _Requirements: 12.1, 12.2_

- [ ] 14. Create custom hooks for responsive behavior
  - [x] 14.1 Create useMediaQuery hook
    - Implement hook to detect viewport width breakpoints
    - Return boolean for each breakpoint (isMobile, isTablet, isDesktop)
    - _Requirements: 13.1, 13.2_

  - [x] 14.2 Create useScrollPosition hook
    - Implement hook to track scroll position
    - Return current scroll Y position
    - Debounce scroll events for performance
    - _Requirements: 6.8_

- [ ] 15. Checkpoint - Verify layout components work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [-] 16. Create feature components - Hero section
  - [x] 16.1 Create Hero component
    - Implement hero section with minimum height 600px
    - Add background image using Next.js Image component
    - Add gradient overlay for text readability
    - Add headline (h1) with responsive font sizes
    - Add subheadline (p) with responsive font sizes
    - Add primary CTA button
    - Implement fade-in and slide-in animations
    - Ensure responsive layout (vertical on mobile, horizontal on desktop)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 16.1_

  - [ ]\* 16.2 Write property tests for Hero component
    - **Property 20: Image Component Usage**
    - **Property 23: Image Dimensions Definition**
    - **Property 25: Image Alt Text Requirement**
    - **Validates: Requirements 16.1, 16.6, 17.1**

  - [ ]\* 16.3 Write unit tests for Hero component
    - Test hero renders headline, subheadline, and CTA
    - Test background image is displayed
    - Test responsive font sizes at different breakpoints
    - Test animations are applied
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 17. Create feature components - Destination cards
  - [x] 17.1 Create DestinationCard component
    - Use Card component as base
    - Add destination image at top using Next.js Image
    - Add destination name as heading
    - Add destination description text
    - Add "Explore" button with outline variant
    - Implement hover effect (lift with shadow increase)
    - Set image height to 192px with object-cover
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 9.4, 9.5, 16.1_

  - [ ]\* 17.2 Write property test for destination card content completeness
    - **Property 2: Destination Card Content Completeness**
    - **Validates: Requirements 3.2, 3.3, 3.4**

  - [ ]\* 17.3 Write property tests for image optimization
    - **Property 21: Image Lazy Loading**
    - **Property 22: Image Placeholder Display**
    - **Property 24: Image Fallback Handling**
    - **Validates: Requirements 16.3, 16.4, 16.7**

  - [ ]\* 17.4 Write unit tests for DestinationCard component
    - Test card renders image, name, and description
    - Test hover effect is applied
    - Test image has correct dimensions
    - Test "Explore" button is present
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 18. Create feature components - Destinations section
  - [x] 18.1 Create DestinationsSection component
    - Add section heading and description
    - Implement responsive grid for destination cards
    - Use 1 column on mobile, 2 columns on tablet, 3 columns on desktop
    - Add staggered fade-in animations for cards
    - Accept destinations array as prop
    - _Requirements: 3.1, 3.6, 3.7, 3.8, 13.3, 13.4, 13.5_

  - [ ]\* 18.2 Write unit tests for DestinationsSection component
    - Test section renders heading and description
    - Test grid layout changes at breakpoints
    - Test destination cards are rendered from array
    - Test staggered animations are applied
    - _Requirements: 3.1, 3.6, 3.7, 3.8_

- [ ] 19. Create feature components - Quiz section
  - [x] 19.1 Create QuizSection component
    - Add section with light blue background (bg-primary-50)
    - Add section heading and description
    - Add 4 travel style icons (Relaxation, Adventure, Culture, Culinary)
    - Add primary CTA button to start quiz
    - Implement responsive layout (2x2 grid on mobile, horizontal on desktop)
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [ ]\* 19.2 Write unit tests for QuizSection component
    - Test section renders heading and description
    - Test 4 travel style icons are displayed
    - Test CTA button is present
    - Test responsive layout changes at breakpoints
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 20. Create feature components - Testimonials
  - [x] 20.1 Create TestimonialCard component
    - Use Card component as base
    - Add user avatar using Next.js Image (48x48px, rounded-full)
    - Add user name and optional role
    - Add testimonial text in italic style
    - _Requirements: 5.2, 5.3, 5.4, 16.1_

  - [x] 20.2 Create TestimonialsSection component
    - Add section heading and description
    - Implement responsive grid for testimonial cards
    - Use 1 column on mobile, 3 columns on desktop
    - Accept testimonials array as prop
    - _Requirements: 5.1, 5.5, 5.6_

  - [ ]\* 20.3 Write property test for testimonial content completeness
    - **Property 3: Testimonial Content Completeness**
    - **Validates: Requirements 5.2, 5.3, 5.4**

  - [ ]\* 20.4 Write unit tests for testimonial components
    - Test TestimonialCard renders text, author, and avatar
    - Test TestimonialsSection renders all testimonials
    - Test responsive grid layout changes at breakpoints
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 21. Checkpoint - Verify feature components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Assemble landing page
  - [x] 22.1 Create landing page (app/page.js)
    - Import all feature section components
    - Add Hero section at top
    - Add DestinationsSection with sample destination data
    - Add QuizSection
    - Add TestimonialsSection with sample testimonial data
    - Ensure proper spacing between sections
    - Add fade-in animation to main content
    - _Requirements: 2.1, 3.1, 4.1, 5.1_

  - [x] 22.2 Create sample data for landing page
    - Create sample destinations array (6 destinations)
    - Create sample testimonials array (3 testimonials)
    - Add placeholder images or use external image URLs
    - _Requirements: 3.1, 5.1_

  - [ ]\* 22.3 Write unit tests for landing page
    - Test all sections are rendered in correct order
    - Test Hero section is at top
    - Test DestinationsSection displays 6 destinations
    - Test QuizSection is present
    - Test TestimonialsSection displays 3 testimonials
    - _Requirements: 2.1, 3.1, 4.1, 5.1_

- [ ] 23. Create placeholder pages for navigation
  - [x] 23.1 Create app/destinations/page.js
    - Add basic page structure with heading
    - Add placeholder text indicating page is under construction
    - _Requirements: 6.2_

  - [x] 23.2 Create app/quiz/page.js
    - Add basic page structure with heading
    - Add placeholder text indicating page is under construction
    - _Requirements: 4.3_

  - [x] 23.3 Create app/profile/page.js
    - Add basic page structure with heading
    - Add placeholder text indicating page is under construction
    - _Requirements: 6.3_

- [ ] 24. Implement error handling components
  - [ ] 24.1 Create ErrorBoundary component
    - Implement React Error Boundary class component
    - Display user-friendly error message on error
    - Add "Refresh Page" button for recovery
    - Log errors to console for debugging
    - _Requirements: 20.2, 20.3, 20.6, 20.7_

  - [ ] 24.2 Create loading state components
    - Create Spinner component for loading indicators
    - Create Skeleton component for skeleton screens
    - _Requirements: 20.1, 20.4_

  - [ ]\* 24.3 Write property tests for error handling
    - **Property 36: Loading State Indicator**
    - **Property 37: Error Message Display**
    - **Property 38: Error Recovery Action**
    - **Property 40: Error Logging**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.6**

  - [ ]\* 24.4 Write unit tests for error handling components
    - Test ErrorBoundary catches and displays errors
    - Test Spinner component renders
    - Test Skeleton component renders
    - _Requirements: 20.1, 20.2, 20.3, 20.6, 20.7_

- [ ] 25. Implement animation system
  - [ ] 25.1 Add animation utilities to globals.css
    - Define custom keyframes (slideInFromRight, fadeInUp)
    - Add animation utility classes
    - Ensure animations respect prefers-reduced-motion
    - _Requirements: 15.1, 15.2, 15.6_

  - [ ]\* 25.2 Write property tests for animations
    - **Property 18: Interactive Element Transition Timing**
    - **Property 19: Animation Duration Limit**
    - **Validates: Requirements 15.3, 15.7**

  - [ ]\* 25.3 Write unit tests for animations
    - Test fade-in animations are applied
    - Test modal animations complete within 300ms
    - Test reduced motion is respected
    - _Requirements: 15.3, 15.4, 15.5, 15.6, 15.7_

- [ ] 26. Checkpoint - Verify landing page is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 27. Implement accessibility enhancements
  - [ ] 27.1 Add skip-to-content link
    - Create skip link component
    - Position skip link at top of page (visually hidden until focused)
    - Link to main content area
    - _Requirements: 17.10_

  - [ ] 27.2 Add ARIA labels to icon buttons
    - Review all icon-only buttons
    - Add aria-label attributes describing button actions
    - _Requirements: 17.6_

  - [ ] 27.3 Verify semantic HTML usage
    - Ensure nav, main, article, section, button elements are used appropriately
    - Replace generic divs with semantic elements where appropriate
    - _Requirements: 17.5_

  - [ ]\* 27.4 Write property tests for accessibility
    - **Property 30: Icon Button ARIA Labels**
    - **Property 31: Form Input Label Association**
    - **Validates: Requirements 17.6, 17.7**

  - [ ]\* 27.5 Run automated accessibility tests
    - Use axe-core to test all pages and components
    - Fix any accessibility violations found
    - Ensure WCAG AA compliance
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10_

- [ ] 28. Implement responsive design testing
  - [ ]\* 28.1 Write property test for touch target minimum size
    - **Property 16: Touch Target Minimum Size**
    - **Validates: Requirements 13.6**

  - [ ]\* 28.2 Write unit tests for responsive layouts
    - Test layouts at 320px, 375px, 768px, 1024px, 1920px viewports
    - Test navigation changes at breakpoints
    - Test grid layouts change at breakpoints
    - Test typography scales at breakpoints
    - Test touch targets meet minimum size on mobile
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [ ] 29. Optimize images and performance
  - [ ] 29.1 Add placeholder images to public directory
    - Create public/images directory
    - Add hero background image
    - Add destination images (6 images)
    - Add testimonial avatar images (3 images)
    - Add fallback placeholder image
    - _Requirements: 16.1, 16.7_

  - [ ] 29.2 Configure Next.js Image optimization
    - Verify all images use Next.js Image component
    - Add explicit width and height to all images
    - Enable lazy loading for below-fold images
    - Add blur placeholders for images
    - Configure image formats (WebP, AVIF)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [ ] 29.3 Implement code splitting and prefetching
    - Verify Next.js automatic code splitting is working
    - Add prefetch to critical navigation links
    - _Requirements: 18.5, 18.6_

  - [ ]\* 29.4 Write unit tests for image optimization
    - Test all images use Next.js Image component
    - Test images have explicit dimensions
    - Test lazy loading is enabled for below-fold images
    - Test fallback placeholders work
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6, 16.7_

- [ ] 30. Performance testing and optimization
  - [ ]\* 30.1 Run Lighthouse performance audit
    - Test landing page with Lighthouse
    - Verify performance score is at least 90
    - Verify FCP is under 1.5s on 3G
    - Verify LCP is under 2.5s on 3G
    - Verify CLS is under 0.1
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ]\* 30.2 Optimize bundle size
    - Analyze bundle size with Next.js analyzer
    - Remove unused dependencies
    - Verify code splitting is effective
    - _Requirements: 18.5_

  - [ ]\* 30.3 Test navigation performance
    - Test page navigation completes within 500ms on fast connections
    - Verify prefetching improves navigation speed
    - _Requirements: 18.7_

- [ ] 31. Create component documentation
  - [x] 31.1 Add JSDoc comments to all components
    - Document component purpose and usage
    - Document all props with types and descriptions
    - Add usage examples in comments
    - _Requirements: 19.7_

  - [x] 31.2 Create component index files
    - Create index.js files in component directories
    - Export all components for clean imports
    - _Requirements: 19.5_

- [ ] 32. Final integration testing
  - [ ]\* 32.1 Write end-to-end tests for critical flows
    - Test landing page loads and displays all sections
    - Test navigation between pages works
    - Test mobile menu opens and closes
    - Test modal opens and closes
    - Test form inputs accept user input
    - _Requirements: 2.7, 6.5, 11.8, 18.7_

  - [ ]\* 32.2 Test error scenarios
    - Test error boundary catches errors
    - Test image loading errors show fallback
    - Test form validation errors display correctly
    - _Requirements: 20.2, 20.3, 20.5, 20.6, 20.7_

- [ ] 33. Final checkpoint - Verify all requirements are met
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and component behavior
- All components should be built with accessibility, responsiveness, and performance in mind
- Use Next.js 16 App Router conventions (app directory, not pages directory)
- Use Tailwind CSS v4 with inline @theme configuration
- Follow React 19 best practices and conventions
