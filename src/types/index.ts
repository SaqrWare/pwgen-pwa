// Core Types
export interface GeneratorOptions {
  length: number;                    // 4-128
  includeLowercase: boolean;
  includeNumerals: boolean;
  includeCapitals: boolean;
  includeSymbols: boolean;
  pronounceable: boolean;
  avoidAmbiguous: boolean;
  count: number;                     // 1-10
}

export interface GeneratedPassword {
  password: string;
  strength: number;                  // 0-100
  options: GeneratorOptions;
  timestamp: Date;
}

export interface StrengthResult {
  score: number;                     // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  entropy: number;                   // bits of entropy
}

export interface StrengthCriteria {
  length: number;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumerals: boolean;
  hasSymbols: boolean;
  hasRepeating: boolean;
  hasSequential: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Storage Types
export interface PasswordEntry {
  id: string;
  label: string;
  password: string;
  strength: number;
  createdAt: Date;
  lastModified: Date;
  expiresAt?: Date;
  generatorOptions?: GeneratorOptions;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultGenerator: GeneratorOptions;
  expirationReminders: boolean;
  defaultExpirationDays: number;
  clipboardTimeout: number;          // ms, 0 = no timeout
}

export interface SearchOptions {
  query?: string;
  minStrength?: number;
  maxStrength?: number;
  hasExpiration?: boolean;
  isExpired?: boolean;
  sortBy?: 'createdAt' | 'label' | 'strength';
  sortOrder?: 'asc' | 'desc';
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
