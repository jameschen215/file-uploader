# Project File Uploader

## What I've learned

### Dark Mode Implementation - Lessons Learned

#### Problem Summary

Implemented a dark mode toggle feature in an Express.js app using EJS templates and Tailwind CSS, but encountered issues where the JavaScript toggle worked (added/removed the `dark` class) but the visual styles weren't changing.

#### Root Cause

The issue was with **Tailwind CSS version compatibility and configuration**:

1. **Version Mismatch**: Using Tailwind CSS v4 (alpha/beta) with `@tailwindcss/postcss` plugin but with v3-style configuration
2. **Wrong Dark Mode Output**: v4 was generating media query-based dark mode (`@media (prefers-color-scheme: dark)`) instead of class-based dark mode (`.dark .dark:bg-zinc-900`)
3. **Incomplete v4 Documentation**: v4's dark mode configuration syntax is still evolving and not well-documented

#### The Fix

**Downgraded to Tailwind CSS v3** for stability and proper class-based dark mode support.

##### Final Working Configuration:

**Package Installation:**

```bash
npm uninstall @tailwindcss/postcss
npm install -D tailwindcss@3.4.10 postcss autoprefixer
```

**`postcss.config.mjs`:**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**`styles.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`tailwind.config.js`:**

```javascript
export default {
  content: [
    './src/public/views/**/*.html',
    './src/views/**/*.ejs',
    './src/public/scripts/**/*.{js,mjs,ts}',
  ],
  darkMode: 'class', // Essential for class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**JavaScript (working correctly from the start):**

```javascript
function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  const theme = html.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
}
```

#### Key Lessons Learned

##### 1. **CSS Output Matters More Than JavaScript**

- The JavaScript was working perfectly (adding/removing `dark` class)
- The real issue was in CSS generation - wrong CSS output means no visual changes
- Always check the compiled CSS output when styles aren't applying

##### 2. **Tailwind Dark Mode Configuration is Critical**

- `darkMode: 'class'` in config is **essential** for JavaScript-controlled dark mode
- Without it, Tailwind generates media-query based styles that respond to system preferences, not JavaScript class toggles
- The CSS should generate `.dark .dark:bg-zinc-900` not `@media (prefers-color-scheme: dark)`

##### 3. **Version Compatibility Issues**

- Tailwind CSS v4 is still in development (alpha/beta) and has breaking changes
- v4 uses different syntax (`darkMode: 'selector'` vs `darkMode: 'class'`)
- Documentation for v4 is incomplete, leading to configuration confusion
- **For production apps, stick with stable versions (v3) unless you need v4-specific features**

##### 4. **Build Process Debugging**

- When styles don't work, check the build pipeline: input CSS → PostCSS → output CSS
- Verify that the built CSS file contains the expected classes
- Test with simple utility classes first (`bg-red-500`) to confirm Tailwind is working

##### 5. **System vs Manual Dark Mode**

- Media query approach: `@media (prefers-color-scheme: dark)` - responds to system settings
- Class approach: `.dark .dark:text-white` - responds to JavaScript class toggling
- Choose the right approach based on your UX requirements

##### 6. **Debugging Strategy**

When dark mode isn't working:

1. ✅ Check if JavaScript is toggling the class correctly
2. ✅ Verify Tailwind config has `darkMode: 'class'`
3. ✅ Confirm PostCSS/build setup is correct
4. ✅ Inspect the compiled CSS output
5. ✅ Test with simple dark mode classes first
6. ✅ Check browser dev tools for CSS being applied

#### Takeaway

**Always match your Tailwind CSS version with the appropriate configuration syntax and build tools. When in doubt, use the stable version (v3) for production applications.**

# Dark Mode Implementation - Lessons Learned

## Problem Summary

Implemented a dark mode toggle feature in an Express.js app using EJS templates and Tailwind CSS, but encountered issues where the JavaScript toggle worked (added/removed the `dark` class) but the visual styles weren't changing.

## Root Cause

The issue was with **Tailwind CSS version compatibility and configuration**:

1. **Version Mismatch**: Using Tailwind CSS v4 (alpha/beta) with `@tailwindcss/postcss` plugin but with v3-style configuration
2. **Wrong Dark Mode Output**: v4 was generating media query-based dark mode (`@media (prefers-color-scheme: dark)`) instead of class-based dark mode (`.dark .dark:bg-zinc-900`)
3. **Incomplete v4 Documentation**: v4's dark mode configuration syntax is still evolving and not well-documented

## The Fix

**Downgraded to Tailwind CSS v3** for stability and proper class-based dark mode support.

### Final Working Configuration:

**Package Installation:**

```bash
npm uninstall @tailwindcss/postcss
npm install -D tailwindcss@3.4.10 postcss autoprefixer
```

**`postcss.config.mjs`:**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**`styles.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`tailwind.config.js`:**

```javascript
export default {
  content: [
    './src/public/views/**/*.html',
    './src/views/**/*.ejs',
    './src/public/scripts/**/*.{js,mjs,ts}',
  ],
  darkMode: 'class', // Essential for class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**JavaScript (working correctly from the start):**

```javascript
function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  const theme = html.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
}
```

## Key Lessons Learned

### 1. **CSS Output Matters More Than JavaScript**

- The JavaScript was working perfectly (adding/removing `dark` class)
- The real issue was in CSS generation - wrong CSS output means no visual changes
- Always check the compiled CSS output when styles aren't applying

### 2. **Tailwind Dark Mode Configuration is Critical**

- `darkMode: 'class'` in config is **essential** for JavaScript-controlled dark mode
- Without it, Tailwind generates media-query based styles that respond to system preferences, not JavaScript class toggles
- The CSS should generate `.dark .dark:bg-zinc-900` not `@media (prefers-color-scheme: dark)`

### 3. **Version Compatibility Issues**

- Tailwind CSS v4 is still in development (alpha/beta) and has breaking changes
- v4 uses different syntax (`darkMode: 'selector'` vs `darkMode: 'class'`)
- Documentation for v4 is incomplete, leading to configuration confusion
- **For production apps, stick with stable versions (v3) unless you need v4-specific features**

### 4. **Build Process Debugging**

- When styles don't work, check the build pipeline: input CSS → PostCSS → output CSS
- Verify that the built CSS file contains the expected classes
- Test with simple utility classes first (`bg-red-500`) to confirm Tailwind is working

### 5. **System vs Manual Dark Mode**

- Media query approach: `@media (prefers-color-scheme: dark)` - responds to system settings
- Class approach: `.dark .dark:text-white` - responds to JavaScript class toggling
- Choose the right approach based on your UX requirements

### 6. **Debugging Strategy**

When dark mode isn't working:

1. ✅ Check if JavaScript is toggling the class correctly
2. ✅ Verify Tailwind config has `darkMode: 'class'`
3. ✅ Confirm PostCSS/build setup is correct
4. ✅ Inspect the compiled CSS output
5. ✅ Test with simple dark mode classes first
6. ✅ Check browser dev tools for CSS being applied

## Working Example Structure

```
project/
├── tailwind.config.js (with darkMode: 'class')
├── postcss.config.mjs (with tailwindcss plugin)
├── src/
│   └── public/
│       └── styles/
│           ├── styles.css (@tailwind directives)
│           └── build.css (compiled output)
└── views/
    └── partials/
        └── navbar.ejs (with dark:* classes)
```

## Takeaway

**Always match your Tailwind CSS version with the appropriate configuration syntax and build tools. When in doubt, use the stable version (v3) for production applications.**

### AJAX layout change

1. Detect if it’s an AJAX request (e.g. req.xhr or a custom header).

2. Render only the partial (like grid-layout.ejs or list-layout.ejs) if it’s AJAX.

3. Render the full page (index.ejs) if it’s a normal request.

**Server-side code:**

```TypeScript
import { RequestHandler } from 'express';

export const getHomepage: RequestHandler = (req, res, next) => {
  const { view } = req.query;

  const items = [
    { category: 'folder', name: 'Books' },
    { category: 'folder', name: 'Code' },
    { category: 'image', name: 'Flowers' },
    { category: 'video', name: 'Highlight' },
    { category: 'file', name: 'Notes' },
  ];

  // If request is AJAX -> return only the partial
  if (req.xhr) {
    if (view === 'list') {
      return res.render('partials/list-layout', { items });
    } else {
      return res.render('partials/grid-layout', { items });
    }
  }

  res.render('index', { items });
};

```

**Client-side code:**

```JavaScript
async function changeLayout(view) {
  try {
    // update toggle button state
    layoutToggle.setAttribute('data-layout', view);
    layoutToggle.innerHTML = view === 'list' ? LAYOUT_GRID : LAYOUT_LIST;

    // fetch and check response
    const res = await fetch(`/?view=${view}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    layoutContainer.innerHTML = html;

  } catch (error) {
    console.error("Failed to change layout:", error);

    // optional: show user feedback
    layoutContainer.innerHTML = `
      <div class="p-4 text-red-600 bg-red-100 rounded">
        Failed to load layout. Please try again.
      </div>
    `;
  }
}
```

### Accessibility & Focus Management

**The Problem:**
Previously, when opening a modal, the keyboard focus remained on the trigger button (in the background). Since the background container was set to inert to prevent interaction, the browser's focus state was effectively "lost" or reset to the top of the browser window. This forced keyboard users to press Tab multiple times (cycling through the browser's address bar) just to reach the modal content.

**The Solution:**
We implemented Programmatic Focus Management to ensure a smooth user experience.

1. Focus Trapping:
   Upon opening, focus is immediately shifted to the modal container itself.

2. Container Configuration:
   The modal wrapper is given `tabindex="-1"`, allowing it to receive programmatic focus via JavaScript while remaining skipped by sequential keyboard navigation.

3. Visual Polish:
   We focus the container instead of the first input to avoid "Phantom Focus" (where the first button is focused but lacks a visible ring, causing the next `Tab` press to jump to the second button).

4. Scroll Safety:
   We use `{ preventScroll: true }` to ensure the browser doesn't attempt to scroll the background page when focus shifts.

**Implementation snippet:**

```JavaScript
// In the showModal function:

// 1. Ensure modal is focusable programmatically
// (HTML: <div id="modal" tabindex="-1" ...>)

// 2. Move focus to the container immediately
modal.focus({ preventScroll: true });
```

### Handling Trigger Buttons Inside Anchor Tags with Event Delegation

While implementing the folder details modal, I ran into an issue where the trigger button was placed inside an anchor tag. Initially, each trigger had its own event listener, which caused the modal logic to use stale dataset values whenever the UI was updated optimistically.

By switching to event delegation, I learned that:

1. I only need one event listener on a parent container, instead of attaching listeners to each trigger.

2. Delegated handlers always read the latest dataset values, so UI updates stay in sync.

3. When a trigger is nested inside an `<a>`, the anchor’s default navigation can fire before bubbling-phase handlers.

4. Using the capturing phase (`addEventListener(..., true)`) lets me intercept the click **before** the anchor navigates.

5. `preventDefault()` and `stopPropagation()` must run **only** when the click originates from the trigger—otherwise normal navigation breaks.

This pattern gives me a stable, predictable solution without removing or reattaching listeners, even as the UI updates dynamically.

### How to view a file from a previous git commit

Use `git show <commit-hash>:path/to/file`

```commandline
git show git show a1b2c3d4:.vscode/settings.json
```
