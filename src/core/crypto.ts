/**
 * Cryptographic utilities using Web Crypto API
 */

/**
 * Generate cryptographically secure random integer
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const randomLimit = maxValue - (maxValue % range);

  let randomValue;
  const randomBytes = new Uint8Array(bytesNeeded);

  do {
    crypto.getRandomValues(randomBytes);
    randomValue = randomBytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0);
  } while (randomValue >= randomLimit);

  return min + (randomValue % range);
}

/**
 * Get random element from array
 */
export function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }
  const index = getRandomInt(0, array.length - 1);
  return array[index]!;
}

/**
 * Shuffle array using Fisher-Yates algorithm with crypto random
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Get multiple random elements from array
 */
export function getRandomElements<T>(array: T[], count: number): T[] {
  if (count > array.length) {
    throw new Error('Count cannot be greater than array length');
  }
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}
