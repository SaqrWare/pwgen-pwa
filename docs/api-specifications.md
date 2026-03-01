# API & Module Specifications

## Module Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────┐
│                   UI Layer                   │
│         (Components, Tabs, Events)           │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│              Application Layer               │
│      (State Management, Orchestration)       │
└──────────────────────────────────────────────┘
                      ↓
┌─────────────────┬──────────────┬─────────────┐
│  Core Module    │Storage Module│ Utils Module│
│  (Generator,    │ (LocalStorage│ (Validators,│
│   Strength)     │   CRUD)      │ Formatters) │
└─────────────────┴──────────────┴─────────────┘
```

---

## 1. Core Module

### 1.1 Password Generator (`src/core/generator.ts`)

#### Types

```typescript
interface GeneratorOptions {
  length: number;                    // 8-128
  includeNumerals: boolean;
  includeCapitals: boolean;
  includeSymbols: boolean;
  pronounceable: boolean;
  avoidAmbiguous: boolean;
  count: number;                     // 1-10
}

interface GeneratedPassword {
  password: string;
  strength: number;                  // 0-100
  options: GeneratorOptions;
  timestamp: Date;
}
```

#### Public API

```typescript
/**
 * Generate one or more passwords based on options
 * @throws {ValidationError} if options are invalid
 */
export function generatePasswords(
  options: GeneratorOptions
): GeneratedPassword[]

/**
 * Generate a single password with default options
 */
export function generatePassword(
  overrides?: Partial<GeneratorOptions>
): GeneratedPassword

/**
 * Validate generator options
 * @returns {ValidationResult} with errors if invalid
 */
export function validateOptions(
  options: GeneratorOptions
): ValidationResult

/**
 * Get default generator options
 */
export function getDefaultOptions(): GeneratorOptions
```

#### Constants

```typescript
export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  DEFAULT_LENGTH: 16,
  MIN_COUNT: 1,
  MAX_COUNT: 10,
  DEFAULT_COUNT: 1
} as const

export const CHARACTER_SETS = {
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  NUMERALS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  AMBIGUOUS: 'O0l1I|',
  VOWELS: 'aeiouAEIOU'
} as const
```

#### Implementation Notes

- Use `crypto.getRandomValues()` for cryptographically secure randomness
- For pronounceable passwords, alternate consonants and vowels
- Ensure at least one character from each selected set is included
- When `avoidAmbiguous` is true, exclude: `0`, `O`, `l`, `1`, `I`, `|`

---

### 1.2 Strength Calculator (`src/core/strength.ts`)

#### Types

```typescript
interface StrengthResult {
  score: number;                     // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  entropy: number;                   // bits of entropy
}

interface StrengthCriteria {
  length: number;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumerals: boolean;
  hasSymbols: boolean;
  hasRepeating: boolean;
  hasSequential: boolean;
}
```

#### Public API

```typescript
/**
 * Calculate password strength
 * Returns a score from 0-100 and detailed analysis
 */
export function calculateStrength(password: string): StrengthResult

/**
 * Get strength level from score
 */
export function getStrengthLevel(score: number): StrengthResult['level']

/**
 * Calculate entropy bits for a password
 */
export function calculateEntropy(password: string): number

/**
 * Analyze password composition
 */
export function analyzeCriteria(password: string): StrengthCriteria
```

#### Strength Scoring Algorithm

```typescript
Base Score Factors:
- Length:
  - 8-11 chars: +20 points
  - 12-15 chars: +30 points
  - 16+ chars: +40 points

- Character Diversity:
  - Lowercase only: +10
  - + Uppercase: +15
  - + Numbers: +20
  - + Symbols: +25

- Entropy:
  - < 28 bits: +0
  - 28-35 bits: +10
  - 36-59 bits: +20
  - 60+ bits: +30

Penalties:
- Repeating characters (aaa): -10
- Sequential (abc, 123): -10
- Common patterns (qwerty): -15
- Dictionary word: -20

Final: min(100, max(0, score))
```

#### Strength Levels

- **Weak** (0-25): Critical security risk
- **Fair** (26-50): Vulnerable to attacks
- **Good** (51-75): Acceptable security
- **Strong** (76-100): Excellent security

---

### 1.3 Crypto Utilities (`src/core/crypto.ts`)

#### Public API

```typescript
/**
 * Generate cryptographically secure random integer
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export function getRandomInt(min: number, max: number): number

/**
 * Get random element from array
 */
export function getRandomElement<T>(array: T[]): T

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[]

/**
 * Generate UUID v4
 */
export function generateUUID(): string
```

---

## 2. Storage Module

### 2.1 Storage Manager (`src/storage/storage.ts`)

#### Types

```typescript
interface PasswordEntry {
  id: string;
  label: string;
  password: string;
  strength: number;
  createdAt: Date;
  lastModified: Date;
  expiresAt?: Date;
}

interface StorageState {
  passwords: PasswordEntry[];
  settings: AppSettings;
  version: number;                   // Schema version
}

interface SearchOptions {
  query?: string;
  minStrength?: number;
  maxStrength?: number;
  hasExpiration?: boolean;
  isExpired?: boolean;
  sortBy?: 'createdAt' | 'label' | 'strength';
  sortOrder?: 'asc' | 'desc';
}
```

#### Public API

```typescript
/**
 * Initialize storage (run on app startup)
 * Handles schema migrations if needed
 */
export function initStorage(): Promise<void>

/**
 * Create a new password entry
 * @returns {string} The ID of the created entry
 */
export function createPassword(
  password: string,
  label: string,
  expiresAt?: Date
): Promise<string>

/**
 * Get password entry by ID
 * @throws {NotFoundError} if password doesn't exist
 */
export function getPassword(id: string): Promise<PasswordEntry>

/**
 * Get all password entries
 */
export function getAllPasswords(): Promise<PasswordEntry[]>

/**
 * Search and filter passwords
 */
export function searchPasswords(
  options: SearchOptions
): Promise<PasswordEntry[]>

/**
 * Update password entry
 */
export function updatePassword(
  id: string,
  updates: Partial<PasswordEntry>
): Promise<void>

/**
 * Delete password entry
 */
export function deletePassword(id: string): Promise<void>

/**
 * Delete all password entries
 */
export function clearAllPasswords(): Promise<void>

/**
 * Get storage statistics
 */
export function getStorageStats(): Promise<{
  count: number;
  sizeKB: number;
  quotaKB: number;
}>

/**
 * Export all passwords as JSON
 */
export function exportPasswords(): Promise<string>

/**
 * Import passwords from JSON
 * @param {boolean} merge - If true, merge with existing. If false, replace.
 */
export function importPasswords(
  json: string,
  merge?: boolean
): Promise<{ imported: number; skipped: number }>
```

#### Storage Keys

```typescript
export const STORAGE_KEYS = {
  PASSWORDS: 'pwgen_passwords',
  SETTINGS: 'pwgen_settings',
  VERSION: 'pwgen_version'
} as const
```

#### Error Types

```typescript
class StorageError extends Error {}
class NotFoundError extends StorageError {}
class ValidationError extends StorageError {}
class QuotaExceededError extends StorageError {}
class ImportError extends StorageError {}
```

---

### 2.2 Settings Manager (`src/storage/settings.ts`)

#### Types

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultGenerator: GeneratorOptions;
  expirationReminders: boolean;
  defaultExpirationDays: number;
  clipboardTimeout: number;          // ms, 0 = no timeout
}
```

#### Public API

```typescript
/**
 * Get current settings
 */
export function getSettings(): Promise<AppSettings>

/**
 * Update settings (partial update)
 */
export function updateSettings(
  updates: Partial<AppSettings>
): Promise<void>

/**
 * Reset settings to defaults
 */
export function resetSettings(): Promise<void>

/**
 * Get default settings
 */
export function getDefaultSettings(): AppSettings
```

#### Default Settings

```typescript
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  defaultGenerator: {
    length: 16,
    includeNumerals: true,
    includeCapitals: true,
    includeSymbols: true,
    pronounceable: false,
    avoidAmbiguous: false,
    count: 1
  },
  expirationReminders: true,
  defaultExpirationDays: 90,
  clipboardTimeout: 30000  // 30 seconds
}
```

---

### 2.3 Migration System (`src/storage/migrations.ts`)

#### Public API

```typescript
/**
 * Run all pending migrations
 */
export function runMigrations(
  currentVersion: number
): Promise<number>

/**
 * Individual migration functions
 */
export const migrations: Record<number, () => Promise<void>>
```

#### Version History

```typescript
// v1: Initial schema
// v2: Add expiresAt field
// v3: Add settings object
// Future: Add categories, tags, etc.
```

---

## 3. UI Module

### 3.1 Theme Manager (`src/ui/theme.ts`)

#### Public API

```typescript
/**
 * Initialize theme system
 */
export function initTheme(): void

/**
 * Set theme
 */
export function setTheme(theme: 'light' | 'dark' | 'auto'): void

/**
 * Get current theme
 */
export function getCurrentTheme(): 'light' | 'dark'

/**
 * Get theme preference
 */
export function getThemePreference(): 'light' | 'dark' | 'auto'

/**
 * Toggle between light and dark
 */
export function toggleTheme(): void
```

---

### 3.2 Clipboard Manager (`src/ui/clipboard.ts`)

#### Public API

```typescript
/**
 * Copy text to clipboard with optional timeout
 * @returns {boolean} Success status
 */
export function copyToClipboard(
  text: string,
  timeout?: number
): Promise<boolean>

/**
 * Show copy feedback (visual indication)
 */
export function showCopyFeedback(element: HTMLElement): void
```

---

### 3.3 Component Base (`src/ui/components/`)

Each component follows this structure:

```typescript
interface ComponentOptions {
  // Component-specific options
}

export class Component {
  private element: HTMLElement
  private options: ComponentOptions

  constructor(options: ComponentOptions)

  // Render component to DOM
  render(): HTMLElement

  // Update component state
  update(data: any): void

  // Clean up event listeners
  destroy(): void

  // Emit custom events
  private emit(event: string, data?: any): void
}
```

#### Component List

- `PasswordInput`: Password field with show/hide toggle
- `StrengthMeter`: Visual strength indicator
- `PasswordCard`: Saved password card
- `Modal`: Generic modal wrapper
- `SearchBar`: Search and filter interface
- `Slider`: Range input with labels
- `Toggle`: Checkbox/switch component
- `Button`: Styled button with states
- `Tabs`: Tab navigation

---

## 4. Utils Module

### 4.1 Validators (`src/utils/validators.ts`)

```typescript
/**
 * Validate password label
 */
export function validateLabel(label: string): ValidationResult

/**
 * Validate generator options
 */
export function validateGeneratorOptions(
  options: GeneratorOptions
): ValidationResult

/**
 * Validate date
 */
export function validateDate(date: Date | string): ValidationResult

/**
 * Validate JSON import
 */
export function validateImportJSON(json: string): ValidationResult

interface ValidationResult {
  valid: boolean
  errors: string[]
}
```

---

### 4.2 Formatters (`src/utils/formatters.ts`)

```typescript
/**
 * Format date for display
 */
export function formatDate(date: Date): string

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string

/**
 * Format expiration status
 */
export function formatExpiration(expiresAt: Date): {
  text: string
  isExpired: boolean
  daysRemaining: number
}

/**
 * Format file size
 */
export function formatBytes(bytes: number): string

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string
```

---

### 4.3 Search (`src/utils/search.ts`)

```typescript
/**
 * Fuzzy search passwords by label
 */
export function fuzzySearch(
  query: string,
  passwords: PasswordEntry[]
): PasswordEntry[]

/**
 * Filter passwords by criteria
 */
export function filterPasswords(
  passwords: PasswordEntry[],
  filters: SearchOptions
): PasswordEntry[]

/**
 * Sort passwords
 */
export function sortPasswords(
  passwords: PasswordEntry[],
  sortBy: SearchOptions['sortBy'],
  order: SearchOptions['sortOrder']
): PasswordEntry[]
```

---

## 5. PWA Module

### 5.1 Service Worker (`src/pwa/service-worker.ts`)

#### Cache Strategy

```typescript
// Cache name versioning
const CACHE_VERSION = 'v1'
const STATIC_CACHE = `pwgen-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `pwgen-dynamic-${CACHE_VERSION}`

// Cache-first strategy for static assets
// Network-first for HTML
// Cache offline fallback
```

#### Events Handled

- `install`: Cache static assets
- `activate`: Clean up old caches
- `fetch`: Serve from cache or network
- `message`: Handle skip waiting

---

### 5.2 Install Prompt (`src/pwa/install.ts`)

```typescript
/**
 * Show PWA install prompt
 */
export function showInstallPrompt(): Promise<boolean>

/**
 * Check if app is installed
 */
export function isInstalled(): boolean

/**
 * Check if install is available
 */
export function isInstallAvailable(): boolean
```

---

## 6. Application Layer

### 6.1 App Controller (`src/app.ts`)

```typescript
/**
 * Main application controller
 */
export class App {
  private state: AppState

  /**
   * Initialize application
   */
  async init(): Promise<void>

  /**
   * Handle tab navigation
   */
  navigateToTab(tab: 'generate' | 'saved' | 'settings'): void

  /**
   * Global event handlers
   */
  private setupEventListeners(): void

  /**
   * Handle errors globally
   */
  private handleError(error: Error): void
}

interface AppState {
  currentTab: string
  passwords: PasswordEntry[]
  settings: AppSettings
  isOffline: boolean
}
```

---

### 6.2 Event System (`src/events.ts`)

```typescript
/**
 * Application-wide event bus
 */
export class EventBus {
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data?: any): void
}

/**
 * Event types
 */
export const EVENTS = {
  PASSWORD_GENERATED: 'password:generated',
  PASSWORD_SAVED: 'password:saved',
  PASSWORD_UPDATED: 'password:updated',
  PASSWORD_DELETED: 'password:deleted',
  THEME_CHANGED: 'theme:changed',
  SETTINGS_UPDATED: 'settings:updated',
  TAB_CHANGED: 'tab:changed',
  ERROR: 'error'
} as const
```

---

## 7. Type Definitions

### 7.1 Global Types (`src/types/index.ts`)

```typescript
// Re-export all types from modules
export * from './core'
export * from './storage'
export * from './ui'

// Global utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncResult<T> = Promise<T>

// API response types
export interface SuccessResponse<T = void> {
  success: true
  data?: T
}

export interface ErrorResponse {
  success: false
  error: string
  details?: any
}

export type ApiResponse<T = void> = SuccessResponse<T> | ErrorResponse
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

Each module should have corresponding test file:

```
src/core/generator.ts     → tests/core/generator.test.ts
src/storage/storage.ts    → tests/storage/storage.test.ts
```

### 8.2 Test Coverage Requirements

- Core modules: 90%+
- Storage modules: 85%+
- UI components: 70%+
- Utils: 90%+

### 8.3 Mock Data

```typescript
// tests/mocks/passwords.ts
export const mockPasswords: PasswordEntry[] = [...]

// tests/mocks/settings.ts
export const mockSettings: AppSettings = {...}
```

---

## 9. Error Handling

### 9.1 Error Types

```typescript
// Base error class
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
  }
}

// Specific errors
export class ValidationError extends AppError {}
export class StorageError extends AppError {}
export class NetworkError extends AppError {}
export class NotFoundError extends AppError {}
```

### 9.2 Error Codes

```typescript
export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  NOT_FOUND: 'NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const
```

---

## 10. Performance Considerations

### 10.1 Optimization Strategies

- **Lazy Loading**: Load tabs/components on demand
- **Debouncing**: Search input (300ms delay)
- **Throttling**: Scroll events (100ms)
- **Memoization**: Expensive calculations (strength, search)
- **Virtual Scrolling**: Large password lists (>100 items)
- **Web Workers**: Password generation for batch operations

### 10.2 Bundle Splitting

```typescript
// Code splitting strategy
main.js           // App shell + critical code
generate.js       // Generator tab
saved.js          // Saved passwords tab
settings.js       // Settings tab
sw.js            // Service worker (separate)
```

---

## 11. Security Best Practices

1. **No Logging**: Never log passwords to console
2. **Secure Random**: Always use `crypto.getRandomValues()`
3. **CSP Headers**: Restrict inline scripts
4. **Input Sanitization**: Escape user input before display
5. **localStorage**: Be aware it's not encrypted
6. **No Analytics**: Don't track user behavior
7. **Clipboard Clearing**: Optional timeout after copy

---

## 12. API Usage Examples

### Example 1: Generate and Save Password

```typescript
import { generatePassword } from './core/generator'
import { createPassword } from './storage/storage'

async function generateAndSave(label: string) {
  // Generate password
  const generated = generatePassword({
    length: 16,
    includeSymbols: true
  })

  // Save to storage
  const id = await createPassword(
    generated.password,
    label,
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  )

  return { id, password: generated.password }
}
```

### Example 2: Search Passwords

```typescript
import { searchPasswords } from './storage/storage'

async function findStrongPasswords() {
  const results = await searchPasswords({
    minStrength: 75,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  return results
}
```

### Example 3: Calculate Strength

```typescript
import { calculateStrength } from './core/strength'

const password = 'aB3$xY9p'
const result = calculateStrength(password)

console.log(result.score)      // 72
console.log(result.level)      // 'good'
console.log(result.feedback)   // ['Add more characters for better security']
```
