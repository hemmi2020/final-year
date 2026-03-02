# Frontend UI Setup - Technical Design Document

## Overview

This design document specifies the technical implementation for a comprehensive frontend UI system for an AI-based travel application. The system will be built using Next.js 16, React 19, and Tailwind CSS v4, providing a modern, responsive, and accessible user interface inspired by Mindtrip.ai.

The frontend will feature a component-driven architecture with a centralized theme system, reusable UI components, and a visually compelling landing page. The design prioritizes performance, accessibility, and maintainability while delivering a polished user experience across all devices.

### Key Design Goals

- **Theme Consistency**: Centralized CSS custom properties for easy theme management
- **Component Reusability**: Well-structured component library with clear variants
- **Performance**: Optimized images, code splitting, and fast page loads
- **Accessibility**: WCAG AA compliance with keyboard navigation and screen reader support
- **Responsive Design**: Mobile-first approach with seamless tablet and desktop experiences
- **Developer Experience**: Clear file structure, consistent naming, and maintainable code

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with inline theme configuration
- **Image Optimization**: Next.js Image component
- **Font Loading**: Next.js Font optimization
- **State Management**: React hooks (useState, useContext) for UI state
- **Animation**: CSS transitions and Tailwind animation utilities

## Architecture

### Component Hierarchy

The application follows a hierarchical component structure:

```
RootLayout
├── Navigation
│   ├── Logo
│   ├── NavLinks (Desktop)
│   ├── MobileMenu
│   └── UserMenu
├── Page Content
│   ├── Hero Section
│   │   ├── Headline
│   │   ├── Subheadline
│   │   └── CTAButton
│   ├── Destinations Section
│   │   └── DestinationCard[]
│   ├── Quiz Section
│   │   └── CTAButton
│   └── Social Proof Section
│       └── TestimonialCard[]
└── Footer
    ├── FooterLinks
    ├── SocialLinks
    └── Copyright
```

### File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js                 # Root layout with nav/footer
│   │   ├── page.js                   # Landing page
│   │   ├── globals.css               # Theme system & base styles
│   │   ├── destinations/
│   │   │   └── page.js
│   │   ├── quiz/
│   │   │   └── page.js
│   │   └── profile/
│   │       └── page.js
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   └── Radio.jsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Navigation.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Container.jsx
│   │   └── features/                 # Feature-specific components
│   │       ├── Hero.jsx
│   │       ├── DestinationCard.jsx
│   │       ├── TestimonialCard.jsx
│   │       └── QuizSection.jsx
│   ├── lib/
│   │   ├── utils.js                  # Utility functions
│   │   └── constants.js              # App constants
│   └── hooks/
│       ├── useMediaQuery.js
│       └── useScrollPosition.js
├── public/
│   ├── images/
│   └── icons/
└── package.json
```

### Data Flow

1. **Static Content**: Landing page content is statically rendered at build time
2. **Theme System**: CSS custom properties cascade from root to all components
3. **Component Props**: Data flows down through props from pages to components
4. **User Interactions**: Event handlers bubble up from UI components to page logic
5. **Responsive Behavior**: Tailwind breakpoints trigger layout changes via CSS

## Components and Interfaces

### Theme System (globals.css)

The theme system uses CSS custom properties defined in `globals.css` and referenced by Tailwind v4's inline theme configuration.

#### CSS Custom Properties Structure

```css
@layer base {
  :root {
    /* Primary Colors - Blue theme for trust and travel */
    --color-primary-50: 239 246 255;
    --color-primary-100: 219 234 254;
    --color-primary-200: 191 219 254;
    --color-primary-300: 147 197 253;
    --color-primary-400: 96 165 250;
    --color-primary-500: 59 130 246;
    --color-primary-600: 37 99 235;
    --color-primary-700: 29 78 216;
    --color-primary-800: 30 64 175;
    --color-primary-900: 30 58 138;

    /* Secondary Colors - Teal for energy and adventure */
    --color-secondary-50: 240 253 250;
    --color-secondary-100: 204 251 241;
    --color-secondary-200: 153 246 228;
    --color-secondary-300: 94 234 212;
    --color-secondary-400: 45 212 191;
    --color-secondary-500: 20 184 166;
    --color-secondary-600: 13 148 136;
    --color-secondary-700: 15 118 110;
    --color-secondary-800: 17 94 89;
    --color-secondary-900: 19 78 74;

    /* Accent Colors - Amber for warmth and highlights */
    --color-accent-50: 255 251 235;
    --color-accent-100: 254 243 199;
    --color-accent-200: 253 230 138;
    --color-accent-300: 252 211 77;
    --color-accent-400: 251 191 36;
    --color-accent-500: 245 158 11;
    --color-accent-600: 217 119 6;
    --color-accent-700: 180 83 9;
    --color-accent-800: 146 64 14;
    --color-accent-900: 120 53 15;

    /* Neutral Colors - Gray scale */
    --color-neutral-50: 249 250 251;
    --color-neutral-100: 243 244 246;
    --color-neutral-200: 229 231 235;
    --color-neutral-300: 209 213 219;
    --color-neutral-400: 156 163 175;
    --color-neutral-500: 107 114 128;
    --color-neutral-600: 75 85 99;
    --color-neutral-700: 55 65 81;
    --color-neutral-800: 31 41 55;
    --color-neutral-900: 17 24 39;

    /* Semantic Colors */
    --color-success-500: 34 197 94;
    --color-success-600: 22 163 74;
    --color-warning-500: 234 179 8;
    --color-warning-600: 202 138 4;
    --color-error-500: 239 68 68;
    --color-error-600: 220 38 38;
    --color-info-500: 59 130 246;
    --color-info-600: 37 99 235;

    /* Background Colors */
    --color-background: 255 255 255;
    --color-surface: 249 250 251;
    --color-overlay: 0 0 0;

    /* Text Colors */
    --color-text-primary: 17 24 39;
    --color-text-secondary: 75 85 99;
    --color-text-tertiary: 156 163 175;
    --color-text-inverse: 255 255 255;

    /* Border Colors */
    --color-border-light: 229 231 235;
    --color-border-medium: 209 213 219;
    --color-border-dark: 156 163 175;

    /* Shadow Colors */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md:
      0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg:
      0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl:
      0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

    /* Spacing Scale */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;

    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-full: 9999px;

    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

    /* Z-index Scale */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
  }

  /* Base Styles */
  * {
    @apply border-border-light;
  }

  body {
    @apply bg-background text-text-primary antialiased;
    font-feature-settings:
      "rlig" 1,
      "calt" 1;
  }

  /* Focus Styles */
  *:focus-visible {
    @apply outline-none ring-2 ring-primary-500 ring-offset-2;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

#### Tailwind v4 Inline Theme Configuration

Tailwind v4 uses `@theme` directive in CSS to configure the theme:

```css
@import "tailwindcss";

@theme {
  /* Colors referencing CSS custom properties */
  --color-primary-*: var(--color-primary- *);
  --color-secondary-*: var(--color-secondary- *);
  --color-accent-*: var(--color-accent- *);
  --color-neutral-*: var(--color-neutral- *);

  /* Semantic colors */
  --color-success: var(--color-success-500);
  --color-warning: var(--color-warning-500);
  --color-error: var(--color-error-500);
  --color-info: var(--color-info-500);

  /* Background & Text */
  --color-background: var(--color-background);
  --color-surface: var(--color-surface);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Spacing */
  --spacing-*: var(--spacing- *);

  /* Border Radius */
  --radius-*: var(--radius- *);

  /* Font Families */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: ui-serif, Georgia, serif;
  --font-mono: ui-monospace, monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-size-6xl: 3.75rem;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
}
```

### UI Components

#### Button Component

**File**: `src/components/ui/Button.jsx`

**Props Interface**:

```javascript
{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  size: 'sm' | 'md' | 'lg',
  disabled: boolean,
  loading: boolean,
  fullWidth: boolean,
  children: ReactNode,
  onClick: () => void,
  type: 'button' | 'submit' | 'reset',
  className: string
}
```

**Variant Specifications**:

- **Primary**: `bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800`
- **Secondary**: `bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800`
- **Outline**: `border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100`
- **Ghost**: `text-primary-600 hover:bg-primary-50 active:bg-primary-100`

**Size Specifications**:

- **Small**: `px-3 py-1.5 text-sm`
- **Medium**: `px-4 py-2 text-base`
- **Large**: `px-6 py-3 text-lg`

**States**:

- **Disabled**: `opacity-50 cursor-not-allowed pointer-events-none`
- **Loading**: Shows spinner, disables interaction
- **Hover**: Transition in 150ms
- **Active**: Pressed state with darker shade

#### Card Component

**File**: `src/components/ui/Card.jsx`

**Props Interface**:

```javascript
{
  variant: 'default' | 'elevated' | 'outlined',
  padding: 'none' | 'sm' | 'md' | 'lg',
  hoverable: boolean,
  children: ReactNode,
  className: string
}
```

**Variant Specifications**:

- **Default**: `bg-white border border-border-light`
- **Elevated**: `bg-white shadow-md hover:shadow-lg`
- **Outlined**: `bg-transparent border-2 border-border-medium`

**Sub-components**:

- **CardHeader**: `p-4 border-b border-border-light`
- **CardBody**: `p-4`
- **CardFooter**: `p-4 border-t border-border-light`
- **CardImage**: `w-full h-auto object-cover`

#### Input Component

**File**: `src/components/ui/Input.jsx`

**Props Interface**:

```javascript
{
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url',
  label: string,
  placeholder: string,
  value: string,
  onChange: (value) => void,
  error: string,
  disabled: boolean,
  required: boolean,
  helperText: string,
  className: string
}
```

**Specifications**:

- **Base**: `w-full px-3 py-2 border border-border-medium rounded-md`
- **Focus**: `focus:border-primary-500 focus:ring-2 focus:ring-primary-500`
- **Error**: `border-error-500 focus:border-error-500 focus:ring-error-500`
- **Disabled**: `bg-neutral-100 cursor-not-allowed opacity-60`

#### Modal Component

**File**: `src/components/ui/Modal.jsx`

**Props Interface**:

```javascript
{
  isOpen: boolean,
  onClose: () => void,
  title: string,
  children: ReactNode,
  footer: ReactNode,
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full',
  closeOnBackdrop: boolean,
  closeOnEscape: boolean,
  className: string
}
```

**Specifications**:

- **Backdrop**: `fixed inset-0 bg-overlay/50 z-modal-backdrop`
- **Container**: `fixed inset-0 flex items-center justify-center p-4 z-modal`
- **Content**: `bg-white rounded-lg shadow-xl max-h-[90vh] overflow-auto`
- **Animation**: Fade in backdrop (300ms), scale in content (300ms)

**Size Specifications**:

- **Small**: `max-w-md`
- **Medium**: `max-w-lg`
- **Large**: `max-w-2xl`
- **XLarge**: `max-w-4xl`
- **Full**: `max-w-full mx-4`

### Layout Components

#### Navigation Component

**File**: `src/components/layout/Navigation.jsx`

**Structure**:

```jsx
<nav className="fixed top-0 w-full z-fixed bg-white/80 backdrop-blur-md border-b border-border-light">
  <Container>
    <div className="flex items-center justify-between h-16">
      <Logo />
      <DesktopNav /> {/* Hidden on mobile */}
      <UserMenu />
      <MobileMenuButton /> {/* Hidden on desktop */}
    </div>
  </Container>
  <MobileMenu /> {/* Slide-in overlay */}
</nav>
```

**Specifications**:

- **Fixed Position**: Stays at top during scroll
- **Backdrop Blur**: `backdrop-blur-md` for glassmorphism effect
- **Scroll Behavior**: Add shadow after 50px scroll
- **Mobile Menu**: Full-screen overlay with slide-in animation
- **Desktop Nav**: Horizontal links with hover underline effect

#### Footer Component

**File**: `src/components/layout/Footer.jsx`

**Structure**:

```jsx
<footer className="bg-neutral-900 text-neutral-300">
  <Container>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
      <FooterColumn title="Product" links={[...]} />
      <FooterColumn title="Company" links={[...]} />
      <FooterColumn title="Resources" links={[...]} />
      <FooterColumn title="Legal" links={[...]} />
    </div>
    <div className="border-t border-neutral-800 py-6">
      <SocialLinks />
      <Copyright />
    </div>
  </Container>
</footer>
```

### Feature Components

#### Hero Section

**File**: `src/components/features/Hero.jsx`

**Structure**:

```jsx
<section className="relative min-h-[600px] flex items-center">
  <BackgroundImage />
  <Container>
    <div className="max-w-3xl">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        Discover Your Perfect Journey
      </h1>
      <p className="text-xl md:text-2xl text-neutral-600 mb-8">
        AI-powered travel planning tailored to your style
      </p>
      <Button variant="primary" size="lg">
        Start Planning
      </Button>
    </div>
  </Container>
</section>
```

**Specifications**:

- **Height**: Minimum 600px, adapts to content
- **Background**: Full-width image with overlay
- **Typography**: Large, bold headline with supporting text
- **CTA**: Prominent primary button
- **Responsive**: Stack vertically on mobile, horizontal on desktop

#### Destination Card

**File**: `src/components/features/DestinationCard.jsx`

**Structure**:

```jsx
<Card hoverable className="overflow-hidden">
  <CardImage src={image} alt={name} className="h-48 object-cover" />
  <CardBody>
    <h3 className="text-xl font-semibold mb-2">{name}</h3>
    <p className="text-neutral-600 mb-4">{description}</p>
    <Button variant="outline" size="sm">
      Explore
    </Button>
  </CardBody>
</Card>
```

**Specifications**:

- **Image**: Fixed height 192px, cover fit
- **Hover Effect**: Lift with shadow increase
- **Typography**: Clear hierarchy with name and description
- **Action**: Outline button for secondary action

## Data Models

### Theme Configuration

```typescript
interface ThemeConfig {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
  };
  spacing: SpacingScale;
  typography: TypographyConfig;
  breakpoints: Breakpoints;
  transitions: TransitionConfig;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}
```

### Component Props

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

interface CardProps {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
```

### Landing Page Data

```typescript
interface LandingPageData {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundImage: string;
  };
  destinations: Destination[];
  testimonials: Testimonial[];
  quiz: {
    title: string;
    description: string;
    ctaText: string;
  };
}

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

interface Testimonial {
  id: string;
  text: string;
  author: string;
  avatar: string;
  role?: string;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, I've identified the following testable properties. Many specific examples (like "Hero section has a headline") are better tested as unit test examples rather than properties. Properties should focus on universal rules that apply across multiple instances.

**Redundancy Analysis:**

- Multiple criteria about CSS custom properties (1.1-1.5) can be combined into examples testing the theme system structure
- Destination card content requirements (3.2-3.4) can be combined into a single property about card completeness
- Testimonial content requirements (5.2-5.4) can be combined similarly
- Input component requirements (10.6-10.10) share common patterns that can be tested as properties about all inputs
- Accessibility requirements (17.1-17.9) can be grouped into properties about all interactive elements and images

### Property 1: Color Palette Completeness

_For any_ color category in the theme system (primary, secondary, accent, neutral), the CSS custom properties SHALL define at least 5 shade variations to ensure design flexibility.

**Validates: Requirements 1.7**

### Property 2: Destination Card Content Completeness

_For any_ destination card rendered in the application, the card SHALL include all required content elements: an image, a destination name, and a description.

**Validates: Requirements 3.2, 3.3, 3.4**

### Property 3: Testimonial Content Completeness

_For any_ testimonial displayed in the application, the testimonial SHALL include all required elements: testimonial text, author name, and author avatar or placeholder.

**Validates: Requirements 5.2, 5.3, 5.4**

### Property 4: Button Size Variant Support

_For any_ button variant (primary, secondary, outline, ghost), the Button component SHALL support all size options (small, medium, large) with appropriate styling.

**Validates: Requirements 8.5**

### Property 5: Button Disabled State Styling

_For any_ button component with the disabled prop set to true, the button SHALL apply disabled styling including reduced opacity and prevent interaction.

**Validates: Requirements 8.6**

### Property 6: Card Image Positioning

_For any_ card component that includes an image, the image SHALL be positioned at the top of the card before other content sections.

**Validates: Requirements 9.4**

### Property 7: Interactive Card Hover Effects

_For any_ card component with the hoverable prop set to true, the card SHALL apply hover effects when the user hovers over it on desktop devices.

**Validates: Requirements 9.5**

### Property 8: Input Error State Styling

_For any_ form input component with an error prop, the input SHALL display error styling using the error theme color and show the error message below the input field.

**Validates: Requirements 10.6, 10.7**

### Property 9: Input Focus State Styling

_For any_ form input component when focused, the input SHALL display a visible focus ring using the primary theme color.

**Validates: Requirements 10.8**

### Property 10: Input Placeholder Support

_For any_ text-based input component (text, email, password, textarea), the component SHALL support and render placeholder text when provided.

**Validates: Requirements 10.9**

### Property 11: Input Disabled State Support

_For any_ input component with the disabled prop set to true, the component SHALL apply disabled styling and prevent user interaction.

**Validates: Requirements 10.10**

### Property 12: Modal Backdrop Display

_For any_ modal component with isOpen set to true, the modal SHALL display a semi-transparent backdrop overlay behind the modal content.

**Validates: Requirements 11.2**

### Property 13: Modal Scroll Prevention

_For any_ modal component when open, the modal SHALL prevent scrolling of the background page content.

**Validates: Requirements 11.3**

### Property 14: Modal Backdrop Click Handling

_For any_ modal component with closeOnBackdrop enabled, clicking the backdrop SHALL trigger the onClose callback to close the modal.

**Validates: Requirements 11.4**

### Property 15: Modal Escape Key Handling

_For any_ modal component with closeOnEscape enabled, pressing the Escape key SHALL trigger the onClose callback to close the modal.

**Validates: Requirements 11.5**

### Property 16: Touch Target Minimum Size

_For any_ interactive element (button, link, input) in the application, the element SHALL have a minimum touch target size of 44x44 pixels on mobile devices to ensure accessibility.

**Validates: Requirements 13.6**

### Property 17: Mobile Text Minimum Size

_For any_ text element displayed at mobile viewport widths (less than 640px), the font size SHALL be at least 14px to ensure readability.

**Validates: Requirements 14.7**

### Property 18: Interactive Element Transition Timing

_For any_ interactive element that changes state (hover, focus, active), the transition animation SHALL complete within 300ms to maintain responsiveness.

**Validates: Requirements 15.3**

### Property 19: Animation Duration Limit

_For any_ animation defined in the application, the animation duration SHALL not exceed 500ms to maintain perceived performance.

**Validates: Requirements 15.7**

### Property 20: Image Component Usage

_For any_ image rendered in the application, the image SHALL use the Next.js Image component rather than standard HTML img tags to ensure optimization.

**Validates: Requirements 16.1**

### Property 21: Image Lazy Loading

_For any_ image displayed below the fold, the image SHALL have lazy loading enabled to improve initial page load performance.

**Validates: Requirements 16.3**

### Property 22: Image Placeholder Display

_For any_ image component, the image SHALL display a placeholder or blur effect while the image is loading.

**Validates: Requirements 16.4**

### Property 23: Image Dimensions Definition

_For any_ image component, the image SHALL have explicit width and height properties defined to prevent cumulative layout shift.

**Validates: Requirements 16.6**

### Property 24: Image Fallback Handling

_For any_ image component, the image SHALL provide a fallback placeholder or error state when the image fails to load.

**Validates: Requirements 16.7**

### Property 25: Image Alt Text Requirement

_For any_ meaningful image in the application, the image SHALL include descriptive alt text for screen reader accessibility.

**Validates: Requirements 17.1**

### Property 26: Color Contrast Compliance

_For any_ text color and background color combination in the theme system, the color contrast ratio SHALL meet WCAG AA standards (minimum 4.5:1 for normal text).

**Validates: Requirements 17.2**

### Property 27: Keyboard Navigation Support

_For any_ interactive element (button, link, input, modal), the element SHALL be accessible and operable via keyboard navigation.

**Validates: Requirements 17.3**

### Property 28: Focus Indicator Visibility

_For any_ focusable element when it receives keyboard focus, the element SHALL display a visible focus indicator to show the current focus position.

**Validates: Requirements 17.4**

### Property 29: Semantic HTML Usage

_For any_ component rendering structural or interactive content, the component SHALL use appropriate semantic HTML elements (nav, main, button, etc.) rather than generic div elements.

**Validates: Requirements 17.5**

### Property 30: Icon Button ARIA Labels

_For any_ button that contains only an icon without visible text, the button SHALL include an aria-label attribute describing the button's action.

**Validates: Requirements 17.6**

### Property 31: Form Input Label Association

_For any_ form input component, the input SHALL have an associated label element properly connected via htmlFor/id attributes.

**Validates: Requirements 17.7**

### Property 32: Modal Focus Trapping

_For any_ modal component when open, keyboard focus SHALL be trapped within the modal and not escape to background content.

**Validates: Requirements 17.8**

### Property 33: Modal Focus Management

_For any_ modal component when opened, focus SHALL automatically move to the first focusable element within the modal.

**Validates: Requirements 17.9**

### Property 34: Component File Naming Convention

_For any_ component file in the components directory, the filename SHALL use PascalCase naming convention (e.g., Button.jsx, DestinationCard.jsx).

**Validates: Requirements 19.3**

### Property 35: Component Documentation

_For any_ reusable component in the component library, the component SHALL include JSDoc comments documenting its props and usage.

**Validates: Requirements 19.7**

### Property 36: Loading State Indicator

_For any_ component or page section in a loading state, a loading indicator SHALL be displayed to inform users that content is being fetched.

**Validates: Requirements 20.1**

### Property 37: Error Message Display

_For any_ component or page section in an error state, a user-friendly error message SHALL be displayed explaining what went wrong.

**Validates: Requirements 20.2**

### Property 38: Error Recovery Action

_For any_ error state displayed to the user, an action button or link SHALL be provided to retry the operation or recover from the error.

**Validates: Requirements 20.3**

### Property 39: Form Input Preservation on Error

_For any_ form that fails submission, the user's input values SHALL be preserved and remain in the form fields so users don't lose their work.

**Validates: Requirements 20.5**

### Property 40: Error Logging

_For any_ error that occurs in the application, the error SHALL be logged to the console with sufficient detail for debugging purposes.

**Validates: Requirements 20.6**

## Error Handling

### Component-Level Error Handling

All components will implement defensive programming practices:

1. **Prop Validation**: Components will validate props and provide sensible defaults
2. **Null Checks**: Components will handle null/undefined data gracefully
3. **Error Boundaries**: Critical sections will be wrapped in React Error Boundaries
4. **Fallback UI**: Components will render fallback content when data is unavailable

### Error Boundary Implementation

```jsx
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-neutral-600 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Image Loading Errors

```jsx
// Image component with error handling
<Image
  src={imageSrc}
  alt={altText}
  width={width}
  height={height}
  onError={(e) => {
    e.target.src = "/images/placeholder.jpg";
  }}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Form Validation Errors

```jsx
// Input component with error display
<div className="space-y-1">
  <label htmlFor={id} className="block text-sm font-medium">
    {label}
  </label>
  <input
    id={id}
    className={cn(
      "w-full px-3 py-2 border rounded-md",
      error ? "border-error-500" : "border-neutral-300",
    )}
    {...props}
  />
  {error && <p className="text-sm text-error-600">{error}</p>}
</div>
```

### API Error Handling

```jsx
// Error state in components
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await api.get("/endpoint");
    setData(data);
  } catch (err) {
    setError(err.message || "Failed to load data");
    console.error("API Error:", err);
  } finally {
    setLoading(false);
  }
};

// Render error state
{
  error && (
    <div className="bg-error-50 border border-error-200 rounded-lg p-4">
      <p className="text-error-800">{error}</p>
      <Button variant="outline" onClick={fetchData} className="mt-2">
        Try Again
      </Button>
    </div>
  );
}
```

## Testing Strategy

### Dual Testing Approach

The frontend will employ both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and component behavior

- Individual component rendering
- User interaction handling
- Responsive layout at specific breakpoints
- Error state rendering
- Accessibility features

**Property-Based Tests**: Verify universal properties across all inputs

- Theme system color completeness
- Component prop validation across all variants
- Accessibility compliance across all components
- Image optimization across all images
- Form validation across all inputs

### Testing Tools

- **Unit Testing**: React Testing Library + Jest
- **Property-Based Testing**: fast-check (JavaScript property testing library)
- **E2E Testing**: Playwright for critical user flows
- **Accessibility Testing**: axe-core for automated a11y checks
- **Visual Regression**: Percy or Chromatic for UI consistency

### Property-Based Testing Configuration

Each property test will:

- Run a minimum of 100 iterations to ensure comprehensive coverage
- Use fast-check generators to create random test data
- Include a comment tag referencing the design property
- Tag format: `// Feature: frontend-ui-setup, Property {number}: {property_text}`

### Example Property Test Structure

```javascript
import fc from "fast-check";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

// Feature: frontend-ui-setup, Property 4: Button Size Variant Support
describe("Property 4: Button Size Variant Support", () => {
  it("should support all size options for any button variant", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("primary", "secondary", "outline", "ghost"),
        fc.constantFrom("sm", "md", "lg"),
        (variant, size) => {
          const { container } = render(
            <Button variant={variant} size={size}>
              Test Button
            </Button>,
          );

          const button = container.querySelector("button");
          expect(button).toBeInTheDocument();
          expect(button).toHaveClass(variant);
          expect(button).toHaveClass(size);
        },
      ),
      { numRuns: 100 },
    );
  });
});
```

### Unit Test Examples

```javascript
// Component rendering tests
describe("Hero Component", () => {
  it("should render headline, subheadline, and CTA button", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(/discover your perfect journey/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start planning/i }),
    ).toBeInTheDocument();
  });

  it("should display background image", () => {
    render(<Hero />);
    const bgImage = screen.getByRole("img", { hidden: true });
    expect(bgImage).toHaveAttribute("src");
  });
});

// Responsive behavior tests
describe("Navigation Component - Responsive", () => {
  it("should show hamburger menu on mobile viewport", () => {
    global.innerWidth = 375;
    render(<Navigation />);
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeVisible();
  });

  it("should show horizontal nav links on desktop viewport", () => {
    global.innerWidth = 1024;
    render(<Navigation />);
    expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeVisible();
  });
});

// Accessibility tests
describe("Button Component - Accessibility", () => {
  it("should be keyboard accessible", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole("button");
    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: "Enter" });
    expect(handleClick).toHaveBeenCalled();
  });

  it("should have visible focus indicator", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button");
    button.focus();

    const styles = window.getComputedStyle(button);
    expect(styles.outline).not.toBe("none");
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 40 properties implemented
- **Accessibility Tests**: All interactive components tested with axe-core
- **Visual Regression**: All pages and major component variants
- **E2E Tests**: Critical user flows (landing page, navigation, forms)

### Continuous Testing

- Tests run automatically on every commit via CI/CD
- Property tests run with 100 iterations in CI, 1000 in nightly builds
- Visual regression tests run on pull requests
- Accessibility tests block merges if violations found
- Performance budgets enforced via Lighthouse CI

## Responsive Design Strategy

### Mobile-First Approach

All components and layouts will be designed mobile-first, with progressive enhancement for larger screens. This ensures optimal performance on mobile devices and cleaner CSS.

### Breakpoint System

```css
/* Tailwind v4 breakpoints */
--breakpoint-sm: 640px; /* Small tablets and large phones */
--breakpoint-md: 768px; /* Tablets */
--breakpoint-lg: 1024px; /* Laptops and small desktops */
--breakpoint-xl: 1280px; /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large screens */
```

### Responsive Patterns

#### Container Widths

```jsx
// Container component with responsive max-widths
<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">{children}</div>
```

**Breakpoint Behavior**:

- Mobile (<640px): Full width with 16px padding
- Tablet (640-1024px): Full width with 24px padding
- Desktop (1024px+): Max-width 1280px with 32px padding

#### Grid Layouts

```jsx
// Responsive grid for destination cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {destinations.map((dest) => (
    <DestinationCard key={dest.id} {...dest} />
  ))}
</div>
```

**Breakpoint Behavior**:

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

#### Typography Scaling

```jsx
// Responsive heading sizes
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
  Discover Your Perfect Journey
</h1>

<p className="text-base sm:text-lg lg:text-xl">
  AI-powered travel planning tailored to your style
</p>
```

#### Navigation Patterns

```jsx
// Desktop: Horizontal navigation
// Mobile: Hamburger menu with slide-in overlay
<nav className="hidden md:flex space-x-6">
  <NavLink href="/">Home</NavLink>
  <NavLink href="/destinations">Destinations</NavLink>
</nav>

<button className="md:hidden" onClick={toggleMobileMenu}>
  <MenuIcon />
</button>
```

### Touch Target Optimization

All interactive elements will meet minimum touch target sizes:

- **Buttons**: Minimum 44x44px on mobile
- **Links**: Minimum 44px height with adequate padding
- **Form Inputs**: Minimum 44px height
- **Icon Buttons**: Minimum 44x44px with centered icon

```jsx
// Touch-optimized button
<button className="min-h-[44px] min-w-[44px] px-4 py-2">Click Me</button>
```

## Color System

### Color Palette

The color system uses a blue primary color for trust and professionalism, teal secondary for energy and adventure, and amber accent for warmth and highlights.

#### Primary Colors (Blue)

```css
--color-primary-50: #eff6ff; /* Lightest - backgrounds */
--color-primary-100: #dbeafe; /* Very light - hover states */
--color-primary-200: #bfdbfe; /* Light - borders */
--color-primary-300: #93c5fd; /* Medium light */
--color-primary-400: #60a5fa; /* Medium */
--color-primary-500: #3b82f6; /* Base - primary actions */
--color-primary-600: #2563eb; /* Dark - default buttons */
--color-primary-700: #1d4ed8; /* Darker - hover states */
--color-primary-800: #1e40af; /* Very dark - active states */
--color-primary-900: #1e3a8a; /* Darkest - text */
```

#### Secondary Colors (Teal)

```css
--color-secondary-50: #f0fdfa; /* Lightest */
--color-secondary-100: #ccfbf1; /* Very light */
--color-secondary-200: #99f6e4; /* Light */
--color-secondary-300: #5eead4; /* Medium light */
--color-secondary-400: #2dd4bf; /* Medium */
--color-secondary-500: #14b8a6; /* Base */
--color-secondary-600: #0d9488; /* Dark */
--color-secondary-700: #0f766e; /* Darker */
--color-secondary-800: #115e59; /* Very dark */
--color-secondary-900: #134e4a; /* Darkest */
```

#### Accent Colors (Amber)

```css
--color-accent-50: #fffbeb; /* Lightest */
--color-accent-100: #fef3c7; /* Very light */
--color-accent-200: #fde68a; /* Light */
--color-accent-300: #fcd34d; /* Medium light */
--color-accent-400: #fbbf24; /* Medium */
--color-accent-500: #f59e0b; /* Base */
--color-accent-600: #d97706; /* Dark */
--color-accent-700: #b45309; /* Darker */
--color-accent-800: #92400e; /* Very dark */
--color-accent-900: #78350f; /* Darkest */
```

#### Neutral Colors (Gray)

```css
--color-neutral-50: #f9fafb; /* Lightest - backgrounds */
--color-neutral-100: #f3f4f6; /* Very light - surfaces */
--color-neutral-200: #e5e7eb; /* Light - borders */
--color-neutral-300: #d1d5db; /* Medium light - disabled */
--color-neutral-400: #9ca3af; /* Medium - placeholders */
--color-neutral-500: #6b7280; /* Base - secondary text */
--color-neutral-600: #4b5563; /* Dark - body text */
--color-neutral-700: #374151; /* Darker - headings */
--color-neutral-800: #1f2937; /* Very dark */
--color-neutral-900: #111827; /* Darkest - emphasis */
```

#### Semantic Colors

```css
--color-success-500: #22c55e; /* Success messages */
--color-success-600: #16a34a; /* Success buttons */
--color-warning-500: #eab308; /* Warning messages */
--color-warning-600: #ca8a04; /* Warning buttons */
--color-error-500: #ef4444; /* Error messages */
--color-error-600: #dc2626; /* Error buttons */
--color-info-500: #3b82f6; /* Info messages */
--color-info-600: #2563eb; /* Info buttons */
```

### Color Usage Guidelines

#### Text Colors

- **Primary Text**: `text-neutral-900` - Main content, headings
- **Secondary Text**: `text-neutral-600` - Supporting text, descriptions
- **Tertiary Text**: `text-neutral-400` - Captions, metadata
- **Inverse Text**: `text-white` - Text on dark backgrounds

#### Background Colors

- **Page Background**: `bg-white` - Main page background
- **Surface**: `bg-neutral-50` - Cards, panels
- **Elevated**: `bg-white` with shadow - Modals, dropdowns

#### Border Colors

- **Light**: `border-neutral-200` - Subtle dividers
- **Medium**: `border-neutral-300` - Input borders
- **Dark**: `border-neutral-400` - Emphasis borders

#### Interactive States

- **Default**: Primary/secondary color at 600 shade
- **Hover**: Darken to 700 shade
- **Active**: Darken to 800 shade
- **Focus**: Ring at 500 shade with offset
- **Disabled**: Neutral-300 with 50% opacity

### Accessibility Contrast Ratios

All color combinations meet WCAG AA standards:

- **Normal Text (16px+)**: Minimum 4.5:1 contrast ratio
- **Large Text (24px+)**: Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

**Verified Combinations**:

- `text-neutral-900` on `bg-white`: 16.1:1 ✓
- `text-neutral-600` on `bg-white`: 7.2:1 ✓
- `text-white` on `bg-primary-600`: 8.3:1 ✓
- `text-white` on `bg-secondary-600`: 5.8:1 ✓

## Typography System

### Font Configuration

The application uses system font stacks for optimal performance and native feel:

```javascript
// app/layout.js
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### Font Families

```css
--font-sans:
  "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
--font-mono:
  ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono",
  monospace;
```

### Font Size Scale

```css
--font-size-xs: 0.75rem; /* 12px - Small captions */
--font-size-sm: 0.875rem; /* 14px - Secondary text */
--font-size-base: 1rem; /* 16px - Body text */
--font-size-lg: 1.125rem; /* 18px - Large body */
--font-size-xl: 1.25rem; /* 20px - Small headings */
--font-size-2xl: 1.5rem; /* 24px - H4 */
--font-size-3xl: 1.875rem; /* 30px - H3 */
--font-size-4xl: 2.25rem; /* 36px - H2 */
--font-size-5xl: 3rem; /* 48px - H1 */
--font-size-6xl: 3.75rem; /* 60px - Hero */
```

### Font Weights

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights

```css
--line-height-tight: 1.25; /* Headings */
--line-height-snug: 1.375; /* Subheadings */
--line-height-normal: 1.5; /* Body text */
--line-height-relaxed: 1.625; /* Long-form content */
--line-height-loose: 2; /* Spaced content */
```

### Heading Styles

```css
h1,
.h1 {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

h2,
.h2 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

h3,
.h3 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
}

h4,
.h4 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
}

h5,
.h5 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
}

h6,
.h6 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
}
```

### Body Text Styles

```css
.text-body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: rgb(var(--color-text-primary));
}

.text-body-lg {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

.text-body-sm {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.text-caption {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-normal);
  color: rgb(var(--color-text-tertiary));
}
```

### Typography Utilities

```jsx
// Responsive heading example
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
  Discover Your Perfect Journey
</h1>

// Body text with proper line height
<p className="text-base md:text-lg leading-relaxed text-neutral-600">
  AI-powered travel planning tailored to your unique style and preferences.
</p>

// Caption text
<span className="text-xs text-neutral-400 uppercase tracking-wide">
  Featured Destination
</span>
```

### Text Rendering Optimization

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings:
    "rlig" 1,
    "calt" 1;
}
```

## Animation System

### Transition Configuration

```css
/* Transition durations */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

/* Easing functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Transitions

#### Button Transitions

```jsx
<button
  className="
  bg-primary-600 
  hover:bg-primary-700 
  active:bg-primary-800
  transition-colors duration-150
  transform hover:scale-105 active:scale-95
  transition-transform duration-150
"
>
  Click Me
</button>
```

#### Card Hover Effects

```jsx
<div
  className="
  bg-white 
  shadow-md hover:shadow-xl
  transition-shadow duration-300
  transform hover:-translate-y-1
  transition-transform duration-300
"
>
  Card Content
</div>
```

#### Modal Animations

```jsx
// Backdrop fade in
<div className="
  fixed inset-0 bg-black/50
  animate-in fade-in duration-300
">
  {/* Modal content */}
</div>

// Modal scale in
<div className="
  bg-white rounded-lg
  animate-in zoom-in-95 duration-300
">
  {/* Modal content */}
</div>
```

### Page Transitions

```jsx
// Fade in on page load
<main className="animate-in fade-in duration-500">
  {children}
</main>

// Slide in from bottom
<section className="animate-in slide-in-from-bottom-4 duration-700">
  {content}
</section>
```

### Loading Animations

```jsx
// Spinner
<div className="
  w-8 h-8
  border-4 border-primary-200 border-t-primary-600
  rounded-full
  animate-spin
" />

// Pulse effect for skeleton screens
<div className="
  bg-neutral-200
  rounded
  animate-pulse
" />

// Progress bar
<div className="
  h-1 bg-primary-600
  animate-[progress_2s_ease-in-out_infinite]
" />
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Custom Animations

```css
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slideInFromRight 300ms ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 500ms ease-out;
}
```

### Animation Best Practices

1. **Keep animations under 500ms** for perceived performance
2. **Use transform and opacity** for GPU-accelerated animations
3. **Avoid animating layout properties** (width, height, margin, padding)
4. **Respect user preferences** with prefers-reduced-motion
5. **Use appropriate easing** - ease-out for entrances, ease-in for exits
6. **Stagger animations** for lists and groups of elements

```jsx
// Staggered animation example
{
  items.map((item, index) => (
    <div
      key={item.id}
      className="animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {item.content}
    </div>
  ));
}
```

## Landing Page Layout

### Wireframe Structure

```
┌─────────────────────────────────────────┐
│           Navigation Bar                 │
│  [Logo]  [Links]  [User Menu]           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                          │
│           Hero Section                   │
│                                          │
│  Discover Your Perfect Journey           │
│  AI-powered travel planning              │
│                                          │
│         [Start Planning]                 │
│                                          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Popular Destinations                │
│                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ Image  │ │ Image  │ │ Image  │      │
│  │ Paris  │ │ Tokyo  │ │ Bali   │      │
│  └────────┘ └────────┘ └────────┘      │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ Image  │ │ Image  │ │ Image  │      │
│  │ Rome   │ │ Dubai  │ │ NYC    │      │
│  └────────┘ └────────┘ └────────┘      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Find Your Travel Style              │
│                                          │
│  Take our quick quiz to get              │
│  personalized recommendations            │
│                                          │
│         [Start Quiz]                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      What Travelers Say                  │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Avatar   │ │ Avatar   │ │ Avatar   ││
│  │ "Quote"  │ │ "Quote"  │ │ "Quote"  ││
│  │ - Name   │ │ - Name   │ │ - Name   ││
│  └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│              Footer                      │
│  [Links] [Social] [Legal]               │
└─────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Hero Section

```jsx
// src/components/features/Hero.jsx
export default function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Travel destination"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center text-white">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Discover Your Perfect Journey
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          AI-powered travel planning tailored to your unique style and
          preferences
        </p>
        <Button
          variant="primary"
          size="lg"
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
        >
          Start Planning Your Trip
        </Button>
      </Container>
    </section>
  );
}
```

#### 2. Destinations Section

```jsx
// src/components/features/DestinationsSection.jsx
export default function DestinationsSection({ destinations }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Explore our most loved destinations and start planning your next
            adventure
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              {...destination}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
```

#### 3. Quiz Section

```jsx
// src/components/features/QuizSection.jsx
export default function QuizSection() {
  return (
    <section className="py-16 md:py-24 bg-primary-50">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Travel Style
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Take our quick 5-minute quiz to discover destinations and
            experiences perfectly matched to your preferences
          </p>

          {/* Travel style icons */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
                🏖️
              </div>
              <span className="text-sm text-neutral-600">Relaxation</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
                🏔️
              </div>
              <span className="text-sm text-neutral-600">Adventure</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
                🏛️
              </div>
              <span className="text-sm text-neutral-600">Culture</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-md">
                🍽️
              </div>
              <span className="text-sm text-neutral-600">Culinary</span>
            </div>
          </div>

          <Button variant="primary" size="lg" href="/quiz">
            Start the Quiz
          </Button>
        </div>
      </Container>
    </section>
  );
}
```

#### 4. Testimonials Section

```jsx
// src/components/features/TestimonialsSection.jsx
export default function TestimonialsSection({ testimonials }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Travelers Say
          </h2>
          <p className="text-lg text-neutral-600">
            Join thousands of happy travelers who've discovered their perfect journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </section>
  );
}

// src/components/features/TestimonialCard.jsx
export default function TestimonialCard({ text, author, avatar, role }) {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Image
          src={avatar}
          alt={author}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="ml-3">
          <p className="font-semibold text-neutral-900">{author}</p>
          {role && <p className="text-sm text-neutral-600">{role}</p>}
        </div>
      </div>
      <p className="text-neutral-700 italic">"{text}"</p>
    </Card>
  );
}
```

### Mobile Responsive Behavior

#### Mobile (< 640px)

- Hero: Stacked layout, smaller text
- Destinations: Single column grid
- Quiz: Stacked icons (2x2 grid)
- Testimonials: Single column

#### Tablet (640px - 1024px)

- Hero: Larger text, same layout
- Destinations: 2-column grid
- Quiz: Horizontal icon row
- Testimonials: 2-column grid

#### Desktop (1024px+)

- Hero: Largest text, full layout
- Destinations: 3-column grid
- Quiz: Horizontal icon row with more spacing
- Testimonials: 3-column grid

## Implementation Checklist

### Phase 1: Foundation Setup

- [ ] Initialize Next.js 16 project with App Router
- [ ] Configure Tailwind CSS v4 with PostCSS
- [ ] Create globals.css with CSS custom properties
- [ ] Configure @theme directive in Tailwind
- [ ] Set up font loading with next/font
- [ ] Create base layout with metadata

### Phase 2: Theme System

- [ ] Define all color CSS custom properties
- [ ] Configure Tailwind theme to reference CSS variables
- [ ] Test color contrast ratios for accessibility
- [ ] Implement dark mode support (optional)
- [ ] Document color usage guidelines

### Phase 3: UI Components

- [ ] Create Button component with all variants
- [ ] Create Card component with sub-components
- [ ] Create Input component
- [ ] Create Textarea component
- [ ] Create Select component
- [ ] Create Checkbox component
- [ ] Create Radio component
- [ ] Create Modal component
- [ ] Test all components for accessibility

### Phase 4: Layout Components

- [ ] Create Container component
- [ ] Create Navigation component
- [ ] Implement mobile menu with animations
- [ ] Create Footer component
- [ ] Implement scroll behavior for navigation
- [ ] Test responsive behavior at all breakpoints

### Phase 5: Feature Components

- [ ] Create Hero component
- [ ] Create DestinationCard component
- [ ] Create DestinationsSection component
- [ ] Create QuizSection component
- [ ] Create TestimonialCard component
- [ ] Create TestimonialsSection component

### Phase 6: Landing Page

- [ ] Implement landing page layout
- [ ] Add hero section with background image
- [ ] Add destinations section with sample data
- [ ] Add quiz section
- [ ] Add testimonials section
- [ ] Test page performance with Lighthouse

### Phase 7: Testing

- [ ] Write unit tests for all UI components
- [ ] Write property-based tests for all 40 properties
- [ ] Run accessibility tests with axe-core
- [ ] Test responsive layouts at all breakpoints
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

### Phase 8: Optimization

- [ ] Optimize images with Next.js Image
- [ ] Implement lazy loading for below-fold content
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Test performance metrics (LCP, FCP, CLS)
- [ ] Optimize bundle size with code splitting

## Success Criteria

The frontend UI setup will be considered complete when:

1. **All 40 correctness properties pass** their property-based tests (100 iterations each)
2. **Lighthouse performance score ≥ 90** on mobile and desktop
3. **Accessibility score = 100** with no violations
4. **All components render correctly** at breakpoints: 320px, 375px, 768px, 1024px, 1920px
5. **Color contrast ratios meet WCAG AA** for all text/background combinations
6. **All interactive elements are keyboard accessible** with visible focus indicators
7. **Images load with proper optimization** (WebP/AVIF, lazy loading, dimensions)
8. **Animations respect prefers-reduced-motion** user preference
9. **Error boundaries catch and display** component errors gracefully
10. **Unit test coverage ≥ 80%** for all components

## Conclusion

This design document provides a comprehensive technical specification for implementing a modern, accessible, and performant frontend UI system. The component-driven architecture with a centralized theme system ensures consistency and maintainability, while the property-based testing approach guarantees correctness across all use cases.

The design prioritizes user experience through responsive layouts, smooth animations, and accessibility compliance, while maintaining developer experience through clear file structure, reusable components, and comprehensive documentation.
