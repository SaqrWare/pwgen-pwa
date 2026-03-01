# UI Wireframes & Design Specifications

## Design Principles

- **Modern & Clean**: Minimal visual clutter, focus on functionality
- **Mobile-First**: Design for small screens, enhance for larger displays
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation support
- **Touch-Friendly**: 44px minimum touch targets on mobile
- **Responsive**: Fluid layouts from 320px to 1920px+

## Color System

### Light Theme
```css
--background: #ffffff
--surface: #f5f5f5
--surface-elevated: #ffffff
--text-primary: #1a1a1a
--text-secondary: #666666
--text-tertiary: #999999
--accent: #2563eb
--accent-hover: #1d4ed8
--success: #16a34a
--warning: #f59e0b
--danger: #dc2626
--border: #e5e5e5
--shadow: rgba(0, 0, 0, 0.1)
```

### Dark Theme
```css
--background: #0a0a0a
--surface: #1a1a1a
--surface-elevated: #262626
--text-primary: #f5f5f5
--text-secondary: #a3a3a3
--text-tertiary: #737373
--accent: #3b82f6
--accent-hover: #60a5fa
--success: #22c55e
--warning: #fbbf24
--danger: #ef4444
--border: #333333
--shadow: rgba(0, 0, 0, 0.3)
```

### Password Strength Colors
- **Weak** (0-25): `#dc2626` (Red)
- **Fair** (26-50): `#f59e0b` (Orange)
- **Good** (51-75): `#eab308` (Yellow)
- **Strong** (76-100): `#16a34a` (Green)

## Typography

```css
--font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'Menlo', 'Monaco', 'Courier New', monospace

--text-xs: 0.75rem (12px)
--text-sm: 0.875rem (14px)
--text-base: 1rem (16px)
--text-lg: 1.125rem (18px)
--text-xl: 1.25rem (20px)
--text-2xl: 1.5rem (24px)
```

## Layout Structure

### Mobile (320px - 767px)
```
┌─────────────────────────────────┐
│         App Header              │
│  [Logo] Password Generator [☾]  │
├─────────────────────────────────┤
│    Tab Navigation (Sticky)      │
│  [Generate] [Saved] [Settings]  │
├─────────────────────────────────┤
│                                 │
│                                 │
│        Tab Content Area         │
│          (Scrollable)           │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Desktop (768px+)
```
┌──────────────────────────────────────────────────┐
│              App Header                          │
│  [Logo] Password Generator          [☾] Theme   │
├──────────────────────────────────────────────────┤
│  Tab Navigation                                  │
│  [Generate Password] [Saved Passwords] [Settings]│
├──────────────────────────────────────────────────┤
│                                                  │
│                                                  │
│              Tab Content Area                    │
│                (Max-width: 1200px, centered)     │
│                                                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Tab 1: Generate Password

### Mobile Layout
```
┌─────────────────────────────────┐
│  Password Generation            │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │  Generated Password Here  │ │
│  │  ******************      │ │
│  │                    [👁] [📋]│
│  └───────────────────────────┘ │
│                                 │
│  Strength: ████████░░ Strong    │
│                                 │
│  ┌─ Options ──────────────────┐│
│  │                            ││
│  │  Password Length: 16       ││
│  │  ◄─────────●───────────►   ││
│  │  (8)                  (128)││
│  │                            ││
│  │  ☑ Include Numbers         ││
│  │  ☑ Include Capitals        ││
│  │  ☑ Include Symbols         ││
│  │  ☐ Pronounceable           ││
│  │  ☐ Avoid Ambiguous         ││
│  │                            ││
│  │  Generate Count: 1         ││
│  │  ◄───●────────►            ││
│  │  (1)         (10)          ││
│  │                            ││
│  └────────────────────────────┘│
│                                 │
│  ┌──────────────────────────┐  │
│  │  [Generate Password]     │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  [Save with Label...]    │  │
│  └──────────────────────────┘  │
│                                 │
│  ─── Multiple Generated ───    │
│  (Shows when count > 1)         │
│                                 │
│  ┌───────────────────────────┐ │
│  │ aB3$xY9p          [👁] [📋]│ │
│  │ 7qR&mN2k          [👁] [📋]│ │
│  │ pL9#wE5t          [👁] [📋]│ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Desktop Layout (768px+)
```
┌──────────────────────────────────────────────┐
│         Generate Secure Passwords            │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Generated Password                    │ │
│  │  aB3$xY9pqR&mN2kL#wE5t     [👁] [📋]  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Strength: ████████████████░░░░ Strong (87%) │
│                                              │
│  ┌─ Configuration ────────────────────────┐ │
│  │                                        │ │
│  │  Password Length: 16                  │ │
│  │  ◄────────────●───────────────────►   │ │
│  │  8                                128 │ │
│  │                                        │ │
│  │  Character Options:                   │ │
│  │  ☑ Numerals (0-9)                     │ │
│  │  ☑ Capitals (A-Z)                     │ │
│  │  ☑ Symbols (!@#$%^&*)                 │ │
│  │  ☐ Pronounceable                      │ │
│  │  ☐ Avoid Ambiguous (0,O,l,1)          │ │
│  │                                        │ │
│  │  Generate Multiple:                   │ │
│  │  ◄───●──────────►                     │ │
│  │  1             10                     │ │
│  │                                        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [Generate Password]  [Save with Label...]  │
│                                              │
└──────────────────────────────────────────────┘
```

## Tab 2: Saved Passwords

### Mobile Layout
```
┌─────────────────────────────────┐
│  Saved Passwords (24)           │
├─────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ 🔍 Search passwords...   │  │
│  └──────────────────────────┘  │
│                                 │
│  Filter: [All ▼] [↓ Newest]    │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Gmail Account             │ │
│  │ ****************    [👁] │ │
│  │ Strong • Jan 15, 2026     │ │
│  │ Expires: Mar 15, 2026     │ │
│  │ [📋] [✏️] [🔄] [🗑️]         │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Work VPN                  │ │
│  │ ****************    [👁] │ │
│  │ Good • Dec 3, 2025        │ │
│  │ [📋] [✏️] [🔄] [🗑️]         │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Bank Password             │ │
│  │ ****************    [👁] │ │
│  │ Strong • Nov 22, 2025     │ │
│  │ ⚠️ Expired 5 days ago     │ │
│  │ [📋] [✏️] [🔄] [🗑️]         │ │
│  └───────────────────────────┘ │
│                                 │
│  [+ Generate New Password]      │
│                                 │
└─────────────────────────────────┘
```

### Long-Press Context Menu (Mobile)
```
┌─────────────────────┐
│  Gmail Account      │
│  ──────────────────│
│  📋 Copy Password   │
│  👁️  Show Password   │
│  ✏️  Edit Label      │
│  🔄 Regenerate      │
│  📅 Set Expiration  │
│  🗑️  Delete          │
└─────────────────────┘
```

### Desktop Layout
```
┌──────────────────────────────────────────────────────┐
│  Saved Passwords (24)                     [+ New]    │
├──────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐│
│  │ 🔍 Search passwords...                          ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  Filter: [All ▼]  Sort: [↓ Newest ▼]  [Export JSON] │
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ Gmail Account                             Strong ││
│  │ ********************************         [👁] [📋]││
│  │ Created: Jan 15, 2026 • Expires: Mar 15, 2026   ││
│  │ [Edit] [Regenerate] [Delete]                    ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ Work VPN                                   Good  ││
│  │ ********************************         [👁] [📋]││
│  │ Created: Dec 3, 2025 • No expiration            ││
│  │ [Edit] [Regenerate] [Delete]                    ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ Bank Password                            Strong  ││
│  │ ********************************         [👁] [📋]││
│  │ Created: Nov 22, 2025                           ││
│  │ ⚠️ Expired 5 days ago (Jan 22, 2026)            ││
│  │ [Edit] [Regenerate] [Delete]                    ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Tab 3: Settings

### Mobile Layout
```
┌─────────────────────────────────┐
│  Settings                       │
├─────────────────────────────────┤
│                                 │
│  ┌─ Appearance ──────────────┐ │
│  │                           │ │
│  │  Theme                    │ │
│  │  ○ Light                  │ │
│  │  ● Dark                   │ │
│  │  ○ Auto (System)          │ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌─ Default Password Options ─┐│
│  │                            ││
│  │  Length: 16                ││
│  │  ◄─────●────────►          ││
│  │                            ││
│  │  ☑ Numbers                 ││
│  │  ☑ Capitals                ││
│  │  ☑ Symbols                 ││
│  │  ☐ Pronounceable           ││
│  │                            ││
│  └────────────────────────────┘│
│                                 │
│  ┌─ Password Expiration ─────┐ │
│  │                           │ │
│  │  ☑ Enable Reminders       │ │
│  │                           │ │
│  │  Default: 90 days         │ │
│  │  ◄────●──────────►        │ │
│  │  30            365        │ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌─ Data Management ─────────┐ │
│  │                           │ │
│  │  [Export All Passwords]   │ │
│  │  [Import Passwords]       │ │
│  │  [Clear All Data]         │ │
│  │                           │ │
│  │  Stored: 24 passwords     │ │
│  │  Storage: 12 KB / 5 MB    │ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌─ About ───────────────────┐ │
│  │                           │ │
│  │  Version: 1.0.0           │ │
│  │  License: MIT             │ │
│  │  [View on GitHub]         │ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Modal: Save Password

### Mobile
```
┌─────────────────────────────────┐
│  Save Password            [×]   │
├─────────────────────────────────┤
│                                 │
│  Password                       │
│  ┌───────────────────────────┐ │
│  │ aB3$xY9p          [👁] [📋]│ │
│  └───────────────────────────┘ │
│                                 │
│  Strength: ████████░░ Strong    │
│                                 │
│  Label (required)               │
│  ┌───────────────────────────┐ │
│  │ Gmail Account             │ │
│  └───────────────────────────┘ │
│                                 │
│  ☐ Set Expiration Date          │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Expires in: 90 days       │ │
│  │ ◄────●──────────►         │ │
│  │ 30            365         │ │
│  └───────────────────────────┘ │
│  (Only shown if checked)        │
│                                 │
│  ┌──────────────────────────┐  │
│  │      [Save Password]     │  │
│  └──────────────────────────┘  │
│                                 │
│          [Cancel]               │
│                                 │
└─────────────────────────────────┘
```

## Modal: Confirm Delete

```
┌─────────────────────────────────┐
│  Delete Password          [×]   │
├─────────────────────────────────┤
│                                 │
│  Are you sure you want to       │
│  delete this password?          │
│                                 │
│  Label: "Gmail Account"         │
│                                 │
│  This action cannot be undone.  │
│                                 │
│  ┌──────────────────────────┐  │
│  │    [Delete Password]     │  │
│  └──────────────────────────┘  │
│                                 │
│          [Cancel]               │
│                                 │
└─────────────────────────────────┘
```

## Component States

### Password Input Field
```
┌────────────────────────────────┐
│ ****************      [👁] [📋] │  Hidden
└────────────────────────────────┘

┌────────────────────────────────┐
│ aB3$xY9pqR&m          [👁] [📋] │  Visible
└────────────────────────────────┘

┌────────────────────────────────┐
│ aB3$xY9pqR&m          [✓] [📋] │  Copied (3s)
└────────────────────────────────┘
```

### Strength Indicator
```
Weak:   ████░░░░░░░░░░░░░░░░ 15%
Fair:   ██████████░░░░░░░░░░ 45%
Good:   ██████████████░░░░░░ 68%
Strong: ████████████████████ 95%
```

### Button States
```
[Generate Password]         Normal
[Generate Password]         Hover (darker)
[Generating...]            Loading (disabled)
```

### Empty State (No Saved Passwords)
```
┌─────────────────────────────────┐
│                                 │
│           🔒                    │
│                                 │
│    No Saved Passwords Yet       │
│                                 │
│  Generate a password and save   │
│  it to see it here.             │
│                                 │
│  ┌──────────────────────────┐  │
│  │  [Generate Password]     │  │
│  └──────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

## Responsive Breakpoints

```css
/* Mobile: 320px - 767px */
@media (max-width: 767px) {
  - Single column layout
  - Full-width components
  - Touch targets: 44px minimum
  - Font sizes: slightly larger for readability
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  - Two-column layout where appropriate
  - Increased padding/spacing
  - Hover states enabled
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  - Max-width container: 1200px
  - Centered content
  - Multi-column layouts
  - Enhanced hover/focus states
  - Keyboard shortcuts
}
```

## Accessibility Features

- **Keyboard Navigation**: Full tab order, Enter/Space activation
- **Screen Readers**: ARIA labels, roles, and live regions
- **Focus States**: Clear visual indicators (2px outline)
- **Color Contrast**: WCAG AA (4.5:1 for text, 3:1 for UI)
- **Skip Links**: Jump to main content
- **Semantic HTML**: Proper heading hierarchy, landmarks
- **Error Messages**: Clear, actionable feedback
- **Alt Text**: Icons paired with text or aria-labels

## Animation & Transitions

```css
/* Subtle, purposeful animations */
--transition-fast: 150ms ease
--transition-normal: 250ms ease
--transition-slow: 350ms ease

/* Examples */
- Button hover: background-color 150ms
- Modal open/close: opacity + transform 250ms
- Tab switching: opacity 150ms
- Theme toggle: colors 350ms
- Copy feedback: opacity 150ms
- Strength bar: width 250ms
```

## Icons

Use modern, simple icon set (consider Lucide or Heroicons):
- 👁️ Show/Hide: Eye / Eye-off
- 📋 Copy: Clipboard
- 🔄 Regenerate: Refresh
- ✏️ Edit: Pencil
- 🗑️ Delete: Trash
- ⚙️ Settings: Gear
- 🔍 Search: Magnifying glass
- ☾ Theme: Moon/Sun
- ⚠️ Warning: Alert triangle
- ✓ Success: Check mark
- + New: Plus icon

## Touch Gestures

- **Tap**: Select, activate buttons
- **Long Press**: Open context menu (saved passwords)
- **Swipe**: Switch tabs (optional enhancement)
- **Pull to Refresh**: Reload (optional enhancement)
