import type { StrengthResult, StrengthCriteria } from '../types';

/**
 * Calculate password strength
 * Returns a score from 0-100 and detailed analysis
 */
export function calculateStrength(password: string): StrengthResult {
  const criteria = analyzeCriteria(password);
  const entropy = calculateEntropy(password);
  const score = calculateScore(criteria, entropy, password);
  const level = getStrengthLevel(score);
  const feedback = generateFeedback(criteria, entropy);

  return {
    score,
    level,
    feedback,
    entropy
  };
}

/**
 * Analyze password composition
 */
export function analyzeCriteria(password: string): StrengthCriteria {
  return {
    length: password.length,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumerals: /[0-9]/.test(password),
    hasSymbols: /[^a-zA-Z0-9]/.test(password),
    hasRepeating: /(.)\1{2,}/.test(password), // 3+ same chars in a row
    hasSequential: hasSequentialChars(password)
  };
}

/**
 * Calculate entropy bits for a password
 */
export function calculateEntropy(password: string): number {
  const criteria = analyzeCriteria(password);

  // Calculate character pool size
  let poolSize = 0;
  if (criteria.hasLowercase) poolSize += 26;
  if (criteria.hasUppercase) poolSize += 26;
  if (criteria.hasNumerals) poolSize += 10;
  if (criteria.hasSymbols) poolSize += 32; // Common symbols

  // Entropy = log2(poolSize^length)
  return Math.log2(Math.pow(poolSize, password.length));
}

/**
 * Get strength level from score
 */
export function getStrengthLevel(score: number): StrengthResult['level'] {
  if (score <= 25) return 'weak';
  if (score <= 50) return 'fair';
  if (score <= 75) return 'good';
  return 'strong';
}

/**
 * Calculate overall strength score (0-100)
 */
function calculateScore(criteria: StrengthCriteria, entropy: number, password: string): number {
  let score = 0;

  // Length scoring (max 40 points)
  if (criteria.length >= 8) score += 20;
  if (criteria.length >= 12) score += 10;
  if (criteria.length >= 16) score += 10;

  // Character diversity (max 25 points)
  if (criteria.hasLowercase) score += 5;
  if (criteria.hasUppercase) score += 7;
  if (criteria.hasNumerals) score += 7;
  if (criteria.hasSymbols) score += 6;

  // Entropy scoring (max 30 points)
  if (entropy >= 28) score += 10;
  if (entropy >= 36) score += 10;
  if (entropy >= 60) score += 10;

  // Penalties
  if (criteria.hasRepeating) score -= 10;
  if (criteria.hasSequential) score -= 10;
  if (isDictionaryWord(password)) score -= 20;
  if (hasCommonPattern(password)) score -= 15;

  // Bonus for very long passwords
  if (criteria.length >= 20) score += 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate feedback messages
 */
function generateFeedback(criteria: StrengthCriteria, entropy: number): string[] {
  const feedback: string[] = [];

  if (criteria.length < 12) {
    feedback.push('Use at least 12 characters for better security');
  }

  if (!criteria.hasUppercase || !criteria.hasLowercase) {
    feedback.push('Mix uppercase and lowercase letters');
  }

  if (!criteria.hasNumerals) {
    feedback.push('Add numbers to increase strength');
  }

  if (!criteria.hasSymbols) {
    feedback.push('Include special symbols (!@#$%^&*)');
  }

  if (criteria.hasRepeating) {
    feedback.push('Avoid repeating characters');
  }

  if (criteria.hasSequential) {
    feedback.push('Avoid sequential characters (abc, 123)');
  }

  if (entropy < 36) {
    feedback.push('Increase character variety');
  }

  if (feedback.length === 0) {
    feedback.push('Excellent password strength!');
  }

  return feedback;
}

/**
 * Check for sequential characters
 */
function hasSequentialChars(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
  ];

  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const substring = seq.substring(i, i + 3);
      if (password.includes(substring)) {
        return true;
      }
      // Check reverse
      if (password.includes(substring.split('').reverse().join(''))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if password is a common dictionary word (simplified)
 */
function isDictionaryWord(password: string): boolean {
  const commonWords = [
    'password', 'welcome', 'admin', 'user', 'test', 'hello',
    'login', 'master', 'default', 'root', 'qwerty', 'letmein',
    'monkey', 'dragon', 'baseball', 'iloveyou', 'trustno1',
    'sunshine', 'princess', 'football'
  ];

  const lower = password.toLowerCase();
  return commonWords.some(word => lower.includes(word));
}

/**
 * Check for common patterns
 */
function hasCommonPattern(password: string): boolean {
  const patterns = [
    /^(.)\1+$/, // All same character
    /^(01|12|23|34|45|56|67|78|89)+$/, // Sequential numbers
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i, // Sequential letters
    /^[0-9]+$/, // All numbers
    /^[a-zA-Z]+$/, // All letters
  ];

  return patterns.some(pattern => pattern.test(password));
}
