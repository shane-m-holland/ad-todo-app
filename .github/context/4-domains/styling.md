# Styling Domain

## Overview

All styling uses Tailwind CSS v3 with a utility-first approach. No custom CSS files per component, no CSS modules, and no inline styles. Global styles are minimal and defined in `app/globals.css`.

## Tailwind Configuration

`tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Extend colors if needed
      },
    },
  },
  plugins: [],
};
export default config;
```

## Global Styles

`app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Minimal global styles */
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}
```

**Keep global styles minimal** - most styling is via Tailwind utilities.

## Common Patterns

### Layout

```typescript
// Full-screen container
<main className="min-h-screen py-12 px-4">

// Centered content
<div className="max-w-4xl mx-auto">

// Responsive padding
<div className="px-4 md:px-8 lg:px-12">
```

### Cards

```typescript
// Basic card
<div className="bg-white rounded-lg shadow-sm p-4 mb-3">

// Card with hover effect
<div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">

// Card with border
<div className="bg-white border border-gray-200 rounded-lg p-4">
```

### Buttons

```typescript
// Primary button
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

// Secondary button
<button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">

// Danger button
<button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">

// Disabled state
<button disabled className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
```

### Inputs

```typescript
// Text input
<input className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />

// Input with error
<input className="w-full px-4 py-3 rounded-lg border-2 border-red-300 bg-red-50" />

// Checkbox
<input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
```

### Typography

```typescript
// Headings
<h1 className="text-4xl font-bold text-gray-900 mb-2">
<h2 className="text-2xl font-semibold text-gray-800 mb-4">

// Body text
<p className="text-base text-gray-600">
<p className="text-sm text-gray-500">

// Error text
<p className="text-sm text-red-600">

// Success text
<p className="text-sm text-green-600">
```

### Spacing

```typescript
// Margin
<div className="mb-4">   // margin-bottom: 1rem
<div className="mt-8">   // margin-top: 2rem
<div className="mx-auto"> // horizontal centering

// Padding
<div className="p-4">    // padding: 1rem
<div className="px-6 py-3"> // padding: 0.75rem 1.5rem

// Gap (flexbox/grid)
<div className="flex gap-4">
<div className="grid gap-2">
```

### Flexbox

```typescript
// Flex container
<div className="flex items-center justify-between">

// Flex direction
<div className="flex flex-col">
<div className="flex flex-row">

// Flex wrap
<div className="flex flex-wrap">

// Flex gap
<div className="flex gap-2">
```

### Colors

```typescript
// Background
className = "bg-white";
className = "bg-gray-100";
className = "bg-blue-600";
className = "bg-red-50";

// Text
className = "text-gray-900";
className = "text-blue-600";
className = "text-red-600";

// Border
className = "border-gray-200";
className = "border-red-300";
```

### Responsive Design

```typescript
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
<div className="px-4 md:px-8 lg:px-12">
<div className="flex-col md:flex-row">

// Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
```

### Transitions

```typescript
// Color transitions
className = "transition-colors hover:bg-blue-700";

// Shadow transitions
className = "transition-shadow hover:shadow-md";

// Transform transitions
className = "transition-transform hover:scale-105";

// Multiple properties
className = "transition-all duration-200";
```

### Conditional Styling

```typescript
// Template literal
<div className={`px-4 py-3 ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>

// clsx/classnames (if library added)
className={clsx(
  "px-4 py-3",
  error && "border-red-300 bg-red-50",
  !error && "border-gray-200 bg-white"
)}
```

## State-Based Styling

### Hover

```typescript
className = "hover:bg-blue-700 hover:shadow-md";
```

### Focus

```typescript
className = "focus:outline-none focus:ring-2 focus:ring-blue-500";
```

### Active

```typescript
className = "active:scale-95";
```

### Disabled

```typescript
className = "disabled:opacity-50 disabled:cursor-not-allowed";
```

### Group Hover

```typescript
<div className="group">
  <span className="group-hover:text-blue-600">
```

## Accessibility Styling

### Screen Reader Only

```typescript
<span className="sr-only">Descriptive text</span>
```

### Focus Visible

```typescript
className = "focus-visible:ring-2 focus-visible:ring-blue-500";
```

## Conventions

1. **Utility-First**: Use Tailwind utilities for all styling
2. **No Inline Styles**: Never use `style` prop
3. **No CSS Modules**: No component-specific CSS files
4. **Mobile First**: Write mobile styles first, then add responsive variants
5. **Consistent Spacing**: Use Tailwind spacing scale (4, 8, 12, 16, etc.)
6. **Semantic Colors**: Use gray-_, blue-_, red-_, green-_ from Tailwind palette
7. **Transitions**: Add transitions for interactive elements
8. **Accessibility**: Include focus states and ARIA when needed

## Anti-Patterns to Avoid

❌ **Don't use inline styles**

```typescript
// BAD
<div style={{ padding: "1rem", backgroundColor: "white" }}>

// GOOD
<div className="p-4 bg-white">
```

❌ **Don't create custom CSS classes**

```typescript
// BAD - custom.css
.my-button {
  padding: 1rem;
  background: blue;
}

// GOOD - Tailwind utilities
<button className="px-4 py-2 bg-blue-600">
```

❌ **Don't use arbitrary values unnecessarily**

```typescript
// BAD (if Tailwind has a utility for it)
className = "px-[17px]";

// GOOD (use standard scale)
className = "px-4";
```

❌ **Don't forget responsive design**

```typescript
// BAD (fixed size)
<div className="text-2xl">

// GOOD (responsive)
<div className="text-lg md:text-xl lg:text-2xl">
```

## PostCSS Configuration

`postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Summary

Styling in this project:

- 100% Tailwind CSS utility classes
- No custom CSS files per component
- No inline styles
- Minimal global styles
- Mobile-first responsive design
- Consistent spacing and colors
- Smooth transitions for interactive elements
- Accessibility-friendly focus states
