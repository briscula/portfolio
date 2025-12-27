# Accessibility Design Patterns

## Introduction

This document outlines the design patterns and implementation strategies for ensuring accessibility compliance across the dividend portfolio application.

## Design Principles

### 1. Semantic HTML Structure

#### Table Design Patterns

- **Grid Role**: Tables use `role="grid"` for screen reader navigation
- **Column Headers**: Each `<th>` has `role="columnheader"` with `scope="col"`
- **Row Groups**: Proper `<thead>` and `<tbody>` structure with `role="rowgroup"`
- **Cell Navigation**: All cells have `role="gridcell"` for proper screen reader support

#### Navigation Structure

- **Landmark Roles**: Use `<header>`, `<main>`, `<section>` for navigation landmarks
- **Heading Hierarchy**: Consistent `h1`, `h2`, `h3` structure for content organization
- **List Semantics**: Related items grouped in semantic `<ul>` and `<ol>` elements

### 2. ARIA Implementation Strategy

#### Dynamic Content Updates

```tsx
// Live regions for status updates
<div aria-live="polite" aria-atomic="true">
  {loadingState ? "Loading portfolios..." : "Portfolios loaded"}
</div>

// Alert regions for errors
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

#### Interactive Element Labeling

```tsx
// Sort buttons with comprehensive labels
<button
  aria-label={`Sort by ${field} ${direction === "asc" ? "ascending" : "descending"}. Press Enter to reverse sort.`}
  aria-sort={sortState}
  onClick={handleSort}
>
  {field}
</button>
```

#### Form Accessibility

```tsx
// Input with proper labeling
<input
  id="portfolio-name"
  aria-describedby="portfolio-name-help"
  aria-invalid={hasError}
  required
/>
<label htmlFor="portfolio-name">Portfolio Name</label>
<div id="portfolio-name-help" aria-live="polite">
  {characterCount}/50 characters
</div>
```

### 3. Keyboard Navigation Design

#### Focus Management Patterns

- **Focus Trapping**: Modals trap focus within dialog boundaries
- **Focus Indicators**: Clear visual focus rings with `focus:ring-2 focus:ring-blue-500`
- **Tab Order**: Logical tab sequence following visual layout
- **Skip Links**: Hidden skip links for bypassing repetitive navigation

#### Keyboard Shortcuts

- **Sort Activation**: Both `Enter` and `Space` keys activate sort buttons
- **Modal Control**: `Escape` key closes modals and dropdowns
- **Menu Navigation**: Arrow keys navigate dropdown menu items
- **Form Submission**: `Enter` submits forms, `Escape` cancels

### 4. Visual Accessibility Design

#### Color and Contrast

- **High Contrast**: All text meets WCAG AA contrast requirements (4.5:1)
- **Color Independence**: Information conveyed through multiple means
- **Visual Indicators**: Gain/loss uses both color and symbols (+/-)
- **Focus Visibility**: Clear focus indicators on all interactive elements

#### Typography and Spacing

- **Readable Fonts**: Clear, legible font choices with adequate size
- **Line Spacing**: Sufficient line height for readability
- **Character Spacing**: Appropriate letter spacing for clarity
- **Touch Targets**: Minimum 44px touch targets for mobile interaction

### 5. Mobile Accessibility Design

#### Touch-Friendly Interface

- **Large Touch Targets**: Minimum 44px for all interactive elements
- **Adequate Spacing**: Sufficient space between touch targets
- **Touch Optimization**: `touch-manipulation` CSS for responsive touch
- **Gesture Alternatives**: Keyboard alternatives for all gesture-based actions

#### Responsive Accessibility

- **Semantic Mobile Layout**: Mobile cards use `<article>` elements
- **Screen Reader Support**: Full screen reader support on mobile devices
- **Touch Navigation**: Touch-friendly navigation patterns
- **Orientation Support**: Works in both portrait and landscape modes

### 6. Screen Reader Optimization

#### Content Structure

```tsx
// Descriptive table structure
<table
  role="grid"
  aria-label={`Portfolio table with ${portfolios.length} portfolios. Use arrow keys to navigate and Enter to activate sort buttons.`}
  aria-rowcount={portfolios.length + 1}
  aria-colcount={8}
>
```

#### Live Region Updates

```tsx
// Status announcements
<div aria-live="polite" aria-atomic="true">
  {isLoading && "Loading portfolio data..."}
  {isError && "Error loading portfolios. Please try again."}
  {isSuccess && `${portfolios.length} portfolios loaded successfully.`}
</div>
```

#### Hidden Content for Screen Readers

```tsx
// Screen reader only instructions
<span className="sr-only">
  Use arrow keys to navigate table cells. Press Enter on sort buttons to change
  sort order.
</span>
```

### 7. Error Handling and Feedback

#### Form Validation

- **Immediate Feedback**: Real-time validation with `aria-live` announcements
- **Error Association**: `aria-describedby` links inputs to error messages
- **Error States**: `aria-invalid` indicates validation errors
- **Help Text**: Clear, actionable error messages

#### Loading States

- **Progress Indicators**: Descriptive loading messages
- **Skeleton Screens**: Accessible loading placeholders
- **Status Updates**: Clear communication of loading progress

### 8. Testing and Validation Design

#### Automated Testing Strategy

- **Jest-Axe Integration**: Automated accessibility testing in component tests
- **WCAG Compliance**: Tests verify compliance with WCAG 2.1 AA standards
- **Regression Prevention**: Accessibility tests prevent regressions in CI/CD

#### Manual Testing Approach

- **Screen Reader Testing**: NVDA, JAWS, VoiceOver, TalkBack
- **Keyboard Navigation**: Full keyboard-only testing
- **Mobile Testing**: Touch and screen reader testing on mobile devices
- **Browser Compatibility**: Cross-browser accessibility testing

## Implementation Guidelines

### For Developers

1. **Always include ARIA labels** for interactive elements
2. **Test with keyboard navigation** before submitting code
3. **Use semantic HTML** elements when possible
4. **Implement focus management** for dynamic content
5. **Test with screen readers** during development

### For Designers

1. **Ensure sufficient color contrast** (4.5:1 minimum)
2. **Design visible focus indicators** for all interactive elements
3. **Consider keyboard navigation** in interaction design
4. **Provide alternative text** for visual information
5. **Design for screen reader users** with clear content hierarchy

## Future Enhancements

### Planned Improvements

- Voice control support
- Reduced motion preferences
- High contrast theme
- Font size preferences
- Advanced keyboard shortcuts

### Monitoring and Maintenance

- Regular accessibility audits
- User feedback collection
- Screen reader compatibility updates
- WCAG guideline compliance monitoring
