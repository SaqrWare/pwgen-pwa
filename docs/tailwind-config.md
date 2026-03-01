# Tailwind CSS Configuration

## Overview

This document provides the Tailwind CSS configuration for the Password Generator application, including custom theme settings, dark mode configuration, and utility classes.

## Tailwind Config File

Create `tailwind.config.js` in the project root:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom color palette
        background: {
          DEFAULT: '#ffffff',
          dark: '#0a0a0a',
        },
        surface: {
          DEFAULT: '#f5f5f5',
          elevated: '#ffffff',
          dark: {
            DEFAULT: '#1a1a1a',
            elevated: '#262626',
          }
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // accent
          600: '#2563eb',  // accent-hover
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          400: '#22c55e',  // dark mode
          600: '#16a34a',  // light mode
        },
        warning: {
          400: '#fbbf24',  // dark mode
          500: '#f59e0b',  // light mode
        },
        danger: {
          400: '#ef4444',  // dark mode
          600: '#dc2626',  // light mode
        },
        strength: {
          weak: '#dc2626',
          fair: '#f59e0b',
          good: '#eab308',
          strong: '#16a34a',
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ],
        mono: [
          'Menlo',
          'Monaco',
          'Courier New',
          'monospace'
        ]
      },
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
      },
      spacing: {
        '18': '4.5rem',       // 72px
        '88': '22rem',        // 352px
        '128': '32rem',       // 512px
      },
      maxWidth: {
        '8xl': '1200px',      // Container max-width
      },
      minHeight: {
        'touch': '44px',      // Minimum touch target
      },
      borderRadius: {
        'DEFAULT': '0.5rem',  // 8px
        'lg': '0.75rem',      // 12px
        'xl': '1rem',         // 16px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease-in-out',
        'slide-up': 'slideUp 250ms ease-out',
        'slide-down': 'slideDown 250ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

## Main CSS File

Create `src/styles/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Base styles */
  * {
    @apply border-gray-200 dark:border-gray-700;
  }

  body {
    @apply bg-background dark:bg-background-dark;
    @apply text-gray-900 dark:text-gray-100;
    @apply font-sans antialiased;
  }

  /* Focus styles for accessibility */
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-primary-500;
  }
}

@layer components {
  /* Button Components */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-fast;
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    @apply min-h-touch; /* Touch target size */
  }

  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white;
    @apply dark:bg-primary-500 dark:hover:bg-primary-400;
  }

  .btn-secondary {
    @apply bg-surface dark:bg-surface-dark text-gray-900 dark:text-gray-100;
    @apply hover:bg-gray-200 dark:hover:bg-gray-800;
    @apply border border-gray-300 dark:border-gray-600;
  }

  .btn-danger {
    @apply bg-danger-600 hover:bg-danger-700 text-white;
    @apply dark:bg-danger-400 dark:hover:bg-danger-500;
  }

  .btn-icon {
    @apply p-2 rounded-lg transition-colors duration-fast;
    @apply hover:bg-gray-100 dark:hover:bg-gray-800;
    @apply min-w-touch min-h-touch flex items-center justify-center;
  }

  /* Input Components */
  .input {
    @apply w-full px-4 py-2 rounded-lg;
    @apply bg-white dark:bg-gray-900;
    @apply border border-gray-300 dark:border-gray-600;
    @apply text-gray-900 dark:text-gray-100;
    @apply placeholder-gray-400 dark:placeholder-gray-500;
    @apply focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20;
    @apply transition-colors duration-fast;
  }

  .input-error {
    @apply border-danger-600 dark:border-danger-400;
    @apply focus:border-danger-600 focus:ring-danger-500/20;
  }

  /* Card Components */
  .card {
    @apply bg-surface-elevated dark:bg-surface-dark-elevated;
    @apply rounded-lg shadow-md;
    @apply border border-gray-200 dark:border-gray-800;
  }

  .card-hover {
    @apply transition-shadow duration-normal;
    @apply hover:shadow-lg;
  }

  /* Password Card */
  .password-card {
    @apply card p-4 mb-3;
    @apply transition-all duration-normal;
  }

  .password-card:hover {
    @apply shadow-lg;
  }

  /* Tab Navigation */
  .tab {
    @apply px-4 py-3 text-base font-medium transition-all duration-fast;
    @apply text-gray-600 dark:text-gray-400;
    @apply border-b-2 border-transparent;
    @apply hover:text-gray-900 dark:hover:text-gray-100;
  }

  .tab-active {
    @apply text-primary-600 dark:text-primary-400;
    @apply border-primary-600 dark:border-primary-400;
  }

  /* Modal */
  .modal-overlay {
    @apply fixed inset-0 bg-black/50 dark:bg-black/70;
    @apply flex items-center justify-center p-4;
    @apply animate-fade-in;
    @apply z-50;
  }

  .modal-content {
    @apply bg-white dark:bg-gray-900;
    @apply rounded-xl shadow-lg;
    @apply max-w-md w-full;
    @apply animate-slide-up;
  }

  /* Password Strength Bar */
  .strength-bar {
    @apply h-2 rounded-full bg-gray-200 dark:bg-gray-700;
    @apply overflow-hidden;
  }

  .strength-fill {
    @apply h-full transition-all duration-normal;
  }

  .strength-weak {
    @apply bg-strength-weak;
  }

  .strength-fair {
    @apply bg-strength-fair;
  }

  .strength-good {
    @apply bg-strength-good;
  }

  .strength-strong {
    @apply bg-strength-strong;
  }

  /* Toggle Switch */
  .toggle {
    @apply relative inline-flex items-center h-6 w-11 rounded-full;
    @apply transition-colors duration-normal;
    @apply bg-gray-300 dark:bg-gray-700;
    @apply cursor-pointer;
  }

  .toggle-active {
    @apply bg-primary-600 dark:bg-primary-500;
  }

  .toggle-thumb {
    @apply inline-block h-4 w-4 rounded-full bg-white;
    @apply transition-transform duration-normal;
    @apply transform translate-x-1;
  }

  .toggle-active .toggle-thumb {
    @apply translate-x-6;
  }

  /* Slider */
  .slider {
    @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg;
    @apply appearance-none cursor-pointer;
  }

  .slider::-webkit-slider-thumb {
    @apply appearance-none w-4 h-4 rounded-full;
    @apply bg-primary-600 dark:bg-primary-500;
    @apply cursor-pointer;
  }

  .slider::-moz-range-thumb {
    @apply w-4 h-4 rounded-full;
    @apply bg-primary-600 dark:bg-primary-500;
    @apply cursor-pointer border-0;
  }

  /* Empty State */
  .empty-state {
    @apply flex flex-col items-center justify-center;
    @apply py-12 px-4 text-center;
  }

  .empty-state-icon {
    @apply text-6xl mb-4 text-gray-400 dark:text-gray-600;
  }

  .empty-state-title {
    @apply text-xl font-semibold mb-2;
    @apply text-gray-900 dark:text-gray-100;
  }

  .empty-state-description {
    @apply text-gray-600 dark:text-gray-400 mb-6;
  }
}

@layer utilities {
  /* Custom utilities */
  .text-balance {
    text-wrap: balance;
  }

  /* Scrollbar styles */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    @apply bg-gray-300 dark:bg-gray-600 rounded-full;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400 dark:bg-gray-500;
  }

  /* Touch target helper */
  .touch-target {
    @apply min-w-touch min-h-touch;
  }

  /* Safe area insets for mobile */
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

## Component Examples with Tailwind Classes

### Button Examples

```html
<!-- Primary Button -->
<button class="btn btn-primary">
  Generate Password
</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">
  Cancel
</button>

<!-- Danger Button -->
<button class="btn btn-danger">
  Delete Password
</button>

<!-- Icon Button -->
<button class="btn-icon">
  <svg class="w-5 h-5"><!-- icon --></svg>
</button>
```

### Input Examples

```html
<!-- Text Input -->
<input
  type="text"
  class="input"
  placeholder="Password label..."
/>

<!-- Input with Error -->
<input
  type="text"
  class="input input-error"
  placeholder="Password label..."
/>
```

### Password Card

```html
<div class="password-card">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-lg font-semibold">Gmail Account</h3>
    <span class="text-sm text-success-600 dark:text-success-400">Strong</span>
  </div>

  <div class="flex items-center gap-2 mb-3">
    <input
      type="password"
      value="aB3$xY9p"
      class="input font-mono flex-1"
      readonly
    />
    <button class="btn-icon">👁</button>
    <button class="btn-icon">📋</button>
  </div>

  <div class="text-sm text-gray-600 dark:text-gray-400">
    Created: Jan 15, 2026
  </div>
</div>
```

### Strength Meter

```html
<div class="strength-bar">
  <div class="strength-fill strength-strong" style="width: 87%"></div>
</div>
<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
  Strong (87%)
</p>
```

### Tab Navigation

```html
<nav class="flex border-b border-gray-200 dark:border-gray-800">
  <button class="tab tab-active">Generate</button>
  <button class="tab">Saved</button>
  <button class="tab">Settings</button>
</nav>
```

### Modal

```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Save Password</h2>

      <input
        type="text"
        class="input mb-4"
        placeholder="Enter label..."
      />

      <div class="flex gap-3">
        <button class="btn btn-primary flex-1">Save</button>
        <button class="btn btn-secondary flex-1">Cancel</button>
      </div>
    </div>
  </div>
</div>
```

### Toggle Switch

```html
<label class="flex items-center cursor-pointer">
  <span class="mr-3">Dark Mode</span>
  <div class="toggle toggle-active">
    <span class="toggle-thumb"></span>
  </div>
</label>
```

### Slider (Range Input)

```html
<div class="mb-4">
  <label class="block text-sm font-medium mb-2">
    Password Length: <span class="text-primary-600">16</span>
  </label>
  <input
    type="range"
    min="8"
    max="128"
    value="16"
    class="slider"
  />
  <div class="flex justify-between text-xs text-gray-500 mt-1">
    <span>8</span>
    <span>128</span>
  </div>
</div>
```

## Dark Mode Toggle Implementation

```typescript
// src/ui/theme.ts
export function toggleDarkMode() {
  const html = document.documentElement

  if (html.classList.contains('dark')) {
    html.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  } else {
    html.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }
}

export function initTheme() {
  const theme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (theme === 'dark' || (!theme && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
}
```

## Responsive Design with Tailwind

```html
<!-- Stack on mobile, side-by-side on desktop -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Column 1</div>
  <div class="flex-1">Column 2</div>
</div>

<!-- Different padding on mobile vs desktop -->
<div class="p-4 md:p-6 lg:p-8">
  Content
</div>

<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">
  Desktop only
</div>

<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">
  Mobile only
</div>
```

## Installation Commands

```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind config
npx tailwindcss init -p

# This creates:
# - tailwind.config.js
# - postcss.config.js
```

## Vite Configuration

Ensure `vite.config.ts` includes PostCSS:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    postcss: './postcss.config.js',
  },
})
```

## PostCSS Configuration

Create `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
