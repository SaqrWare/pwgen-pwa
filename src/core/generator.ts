import type { GeneratorOptions, GeneratedPassword, ValidationResult } from '../types';
import { getRandomInt, shuffleArray } from './crypto';
import { calculateStrength } from './strength';

// Character sets
export const CHARACTER_SETS = {
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  NUMERALS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  AMBIGUOUS: 'O0l1I|',
  VOWELS: 'aeiouAEIOU',
  CONSONANTS: 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ'
} as const;

// Constraints
export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 4,
  MAX_LENGTH: 128,
  DEFAULT_LENGTH: 16,
  MIN_COUNT: 1,
  MAX_COUNT: 10,
  DEFAULT_COUNT: 1
} as const;

/**
 * Get default generator options
 */
export function getDefaultOptions(): GeneratorOptions {
  return {
    length: PASSWORD_CONSTRAINTS.DEFAULT_LENGTH,
    includeLowercase: true,
    includeNumerals: true,
    includeCapitals: true,
    includeSymbols: true,
    pronounceable: false,
    avoidAmbiguous: false,
    count: PASSWORD_CONSTRAINTS.DEFAULT_COUNT
  };
}

/**
 * Validate generator options
 */
export function validateOptions(options: GeneratorOptions): ValidationResult {
  const errors: string[] = [];

  if (options.length < PASSWORD_CONSTRAINTS.MIN_LENGTH) {
    errors.push(`Length must be at least ${PASSWORD_CONSTRAINTS.MIN_LENGTH}`);
  }

  if (options.length > PASSWORD_CONSTRAINTS.MAX_LENGTH) {
    errors.push(`Length must not exceed ${PASSWORD_CONSTRAINTS.MAX_LENGTH}`);
  }

  if (options.count < PASSWORD_CONSTRAINTS.MIN_COUNT) {
    errors.push(`Count must be at least ${PASSWORD_CONSTRAINTS.MIN_COUNT}`);
  }

  if (options.count > PASSWORD_CONSTRAINTS.MAX_COUNT) {
    errors.push(`Count must not exceed ${PASSWORD_CONSTRAINTS.MAX_COUNT}`);
  }

  if (!options.includeLowercase && !options.includeNumerals && !options.includeCapitals && !options.includeSymbols && !options.pronounceable) {
    errors.push('At least one character set must be selected');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate one or more passwords based on options
 */
export function generatePasswords(options: GeneratorOptions): GeneratedPassword[] {
  const validation = validateOptions(options);
  if (!validation.valid) {
    throw new Error(`Invalid options: ${validation.errors.join(', ')}`);
  }

  const passwords: GeneratedPassword[] = [];
  const timestamp = new Date();

  for (let i = 0; i < options.count; i++) {
    const password = options.pronounceable
      ? generatePronounceablePassword(options)
      : generateRandomPassword(options);

    const strength = calculateStrength(password);

    passwords.push({
      password,
      strength: strength.score,
      options,
      timestamp
    });
  }

  return passwords;
}

/**
 * Generate a single password with default options
 */
export function generatePassword(overrides?: Partial<GeneratorOptions>): GeneratedPassword {
  const options = { ...getDefaultOptions(), ...overrides, count: 1 };
  return generatePasswords(options)[0]!;
}

/**
 * Generate a random password
 */
function generateRandomPassword(options: GeneratorOptions): string {
  const charPool = buildCharacterPool(options);

  if (charPool.length === 0) {
    throw new Error('Character pool is empty');
  }

  // Generate random password
  const passwordChars: string[] = [];

  // Ensure at least one character from each selected set
  const requiredChars = getRequiredCharacters(options);
  passwordChars.push(...requiredChars);

  // Fill the rest with random characters
  const remaining = options.length - passwordChars.length;
  for (let i = 0; i < remaining; i++) {
    const randomIndex = getRandomInt(0, charPool.length - 1);
    passwordChars.push(charPool[randomIndex]!);
  }

  // Shuffle to avoid predictable patterns
  const shuffled = shuffleArray(passwordChars);

  return shuffled.join('');
}

/**
 * Generate a pronounceable password (alternating consonants and vowels)
 */
function generatePronounceablePassword(options: GeneratorOptions): string {
  let consonants = 'bcdfghjklmnpqrstvwxyz';
  let vowels = 'aeiou';

  // Add capitals if needed
  if (options.includeCapitals) {
    consonants += consonants.toUpperCase();
    vowels += vowels.toUpperCase();
  }

  // Build character arrays
  const consonantArray = consonants.split('');
  const vowelArray = vowels.split('');

  const passwordChars: string[] = [];
  let useConsonant = getRandomInt(0, 1) === 0;

  for (let i = 0; i < options.length; i++) {
    if (i > 0 && options.includeNumerals && getRandomInt(0, 4) === 0) {
      // 20% chance to insert a number
      const num = getRandomInt(0, 9).toString();
      passwordChars.push(num);
    } else if (i > 0 && options.includeSymbols && getRandomInt(0, 5) === 0) {
      // 16% chance to insert a symbol
      const symbols = options.avoidAmbiguous
        ? CHARACTER_SETS.SYMBOLS.replace(/[|]/g, '')
        : CHARACTER_SETS.SYMBOLS;
      const randomIndex = getRandomInt(0, symbols.length - 1);
      passwordChars.push(symbols[randomIndex]!);
    } else {
      // Alternate between consonants and vowels
      const pool = useConsonant ? consonantArray : vowelArray;
      const randomIndex = getRandomInt(0, pool.length - 1);
      passwordChars.push(pool[randomIndex]!);
      useConsonant = !useConsonant;
    }
  }

  // Ensure minimum length
  while (passwordChars.length < options.length) {
    const pool = useConsonant ? consonantArray : vowelArray;
    const randomIndex = getRandomInt(0, pool.length - 1);
    passwordChars.push(pool[randomIndex]!);
    useConsonant = !useConsonant;
  }

  return passwordChars.slice(0, options.length).join('');
}

/**
 * Build character pool based on options
 */
function buildCharacterPool(options: GeneratorOptions): string {
  let pool = '';

  if (options.includeLowercase) {
    pool += CHARACTER_SETS.LOWERCASE;
  }

  if (options.includeCapitals) {
    pool += CHARACTER_SETS.UPPERCASE;
  }

  if (options.includeNumerals) {
    pool += CHARACTER_SETS.NUMERALS;
  }

  if (options.includeSymbols) {
    pool += CHARACTER_SETS.SYMBOLS;
  }

  // Remove ambiguous characters if needed
  if (options.avoidAmbiguous) {
    pool = pool.split('').filter(char => !CHARACTER_SETS.AMBIGUOUS.includes(char)).join('');
  }

  return pool;
}

/**
 * Get required characters to ensure at least one from each selected set
 */
function getRequiredCharacters(options: GeneratorOptions): string[] {
  const required: string[] = [];

  // Include at least one lowercase if selected
  if (options.includeLowercase) {
    const lowercaseChars = options.avoidAmbiguous
      ? CHARACTER_SETS.LOWERCASE.replace(/[l]/g, '')
      : CHARACTER_SETS.LOWERCASE;
    const randomLowercase = lowercaseChars[getRandomInt(0, lowercaseChars.length - 1)];
    if (randomLowercase) required.push(randomLowercase);
  }

  if (options.includeCapitals) {
    const uppercaseChars = options.avoidAmbiguous
      ? CHARACTER_SETS.UPPERCASE.replace(/[OI]/g, '')
      : CHARACTER_SETS.UPPERCASE;
    const randomUppercase = uppercaseChars[getRandomInt(0, uppercaseChars.length - 1)];
    if (randomUppercase) required.push(randomUppercase);
  }

  if (options.includeNumerals) {
    const numeralChars = options.avoidAmbiguous
      ? CHARACTER_SETS.NUMERALS.replace(/[01]/g, '')
      : CHARACTER_SETS.NUMERALS;
    const randomNumeral = numeralChars[getRandomInt(0, numeralChars.length - 1)];
    if (randomNumeral) required.push(randomNumeral);
  }

  if (options.includeSymbols) {
    const symbolChars = options.avoidAmbiguous
      ? CHARACTER_SETS.SYMBOLS.replace(/[|]/g, '')
      : CHARACTER_SETS.SYMBOLS;
    const randomSymbol = symbolChars[getRandomInt(0, symbolChars.length - 1)];
    if (randomSymbol) required.push(randomSymbol);
  }

  return required;
}
