import type { PasswordEntry, SearchOptions } from '@/types/index.ts';
import { generateUUID } from '@/core/crypto.ts';
import { calculateStrength } from '@/core/strength.ts';
import { runMigrations } from './migrations.ts';

// Storage keys
export const STORAGE_KEYS = {
  PASSWORDS: 'pwgen_passwords',
  SETTINGS: 'pwgen_settings',
  VERSION: 'pwgen_version',
  GENERATOR_OPTIONS: 'pwgen_generator_options',
} as const;

// Error classes
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class NotFoundError extends StorageError {
  constructor(id: string) {
    super(`Password entry not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends StorageError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor() {
    super('localStorage quota exceeded');
    this.name = 'QuotaExceededError';
  }
}

export class ImportError extends StorageError {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}

// Date reviver for JSON.parse — restores ISO date strings to Date objects
function dateReviver(_key: string, value: unknown): unknown {
  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}

// Internal helpers
function readPasswords(): PasswordEntry[] {
  const raw = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
  if (!raw) return [];
  return JSON.parse(raw, dateReviver) as PasswordEntry[];
}

function writePasswords(passwords: PasswordEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' ||
        e.code === DOMException.QUOTA_EXCEEDED_ERR)
    ) {
      throw new QuotaExceededError();
    }
    throw new StorageError(`Failed to write passwords: ${String(e)}`);
  }
}

// Public API

export async function initStorage(): Promise<void> {
  const versionStr = localStorage.getItem(STORAGE_KEYS.VERSION);
  const currentVersion = versionStr ? parseInt(versionStr, 10) : 0;
  const newVersion = await runMigrations(currentVersion);
  localStorage.setItem(STORAGE_KEYS.VERSION, String(newVersion));
}

export async function createPassword(
  password: string,
  label: string,
  expiresAt?: Date,
  generatorOptions?: PasswordEntry['generatorOptions'],
): Promise<string> {
  if (!password) throw new ValidationError('Password is required');
  if (!label || !label.trim()) throw new ValidationError('Label is required');

  const strength = calculateStrength(password);
  const now = new Date();
  const entry: PasswordEntry = {
    id: generateUUID(),
    label: label.trim(),
    password,
    strength: strength.score,
    createdAt: now,
    lastModified: now,
    expiresAt,
    generatorOptions,
  };

  const passwords = readPasswords();
  passwords.push(entry);
  writePasswords(passwords);

  return entry.id;
}

export async function getPassword(id: string): Promise<PasswordEntry> {
  const passwords = readPasswords();
  const entry = passwords.find((p) => p.id === id);
  if (!entry) throw new NotFoundError(id);
  return entry;
}

export async function getAllPasswords(): Promise<PasswordEntry[]> {
  return readPasswords();
}

export async function searchPasswords(
  options: SearchOptions,
): Promise<PasswordEntry[]> {
  let results = readPasswords();

  // Filter by query (search in label)
  if (options.query) {
    const query = options.query.toLowerCase();
    results = results.filter((p) => p.label.toLowerCase().includes(query));
  }

  // Filter by strength range
  if (options.minStrength !== undefined) {
    results = results.filter((p) => p.strength >= options.minStrength!);
  }
  if (options.maxStrength !== undefined) {
    results = results.filter((p) => p.strength <= options.maxStrength!);
  }

  // Filter by expiration
  if (options.hasExpiration !== undefined) {
    results = results.filter(
      (p) => (p.expiresAt !== undefined) === options.hasExpiration,
    );
  }
  if (options.isExpired !== undefined) {
    const now = new Date();
    results = results.filter((p) => {
      if (!p.expiresAt) return !options.isExpired;
      const expired = p.expiresAt <= now;
      return expired === options.isExpired;
    });
  }

  // Sort
  const sortBy = options.sortBy ?? 'createdAt';
  const sortOrder = options.sortOrder ?? 'desc';
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  results.sort((a, b) => {
    switch (sortBy) {
      case 'label':
        return multiplier * a.label.localeCompare(b.label);
      case 'strength':
        return multiplier * (a.strength - b.strength);
      case 'createdAt':
      default:
        return (
          multiplier * (a.createdAt.getTime() - b.createdAt.getTime())
        );
    }
  });

  return results;
}

export async function updatePassword(
  id: string,
  updates: Partial<PasswordEntry>,
): Promise<void> {
  const passwords = readPasswords();
  const index = passwords.findIndex((p) => p.id === id);
  if (index === -1) throw new NotFoundError(id);

  const existing = passwords[index]!;

  // Protect immutable fields
  const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;

  // Recalculate strength if password changed
  let strength = existing.strength;
  if (safeUpdates.password && safeUpdates.password !== existing.password) {
    strength = calculateStrength(safeUpdates.password).score;
  }

  passwords[index] = {
    ...existing,
    ...safeUpdates,
    id: existing.id,
    createdAt: existing.createdAt,
    strength,
    lastModified: new Date(),
  };

  writePasswords(passwords);
}

export async function deletePassword(id: string): Promise<void> {
  const passwords = readPasswords();
  const index = passwords.findIndex((p) => p.id === id);
  if (index === -1) throw new NotFoundError(id);
  passwords.splice(index, 1);
  writePasswords(passwords);
}

export async function clearAllPasswords(): Promise<void> {
  writePasswords([]);
}

export async function getStorageStats(): Promise<{
  count: number;
  sizeKB: number;
  quotaKB: number;
}> {
  const raw = localStorage.getItem(STORAGE_KEYS.PASSWORDS) ?? '[]';
  const sizeBytes = new Blob([raw]).size;
  const passwords = readPasswords();

  return {
    count: passwords.length,
    sizeKB: Math.round((sizeBytes / 1024) * 100) / 100,
    quotaKB: 5120, // 5MB estimate
  };
}

export async function exportPasswords(): Promise<string> {
  const passwords = readPasswords();
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      passwords,
    },
    null,
    2,
  );
}

export async function importPasswords(
  json: string,
  merge = false,
): Promise<{ imported: number; skipped: number }> {
  let data: { version?: number; passwords?: unknown[] };
  try {
    data = JSON.parse(json, dateReviver) as typeof data;
  } catch {
    throw new ImportError('Invalid JSON format');
  }

  if (!data.passwords || !Array.isArray(data.passwords)) {
    throw new ImportError('Invalid export format: missing passwords array');
  }

  // Validate each entry has required fields
  const validEntries: PasswordEntry[] = [];
  for (const entry of data.passwords) {
    if (
      typeof entry === 'object' &&
      entry !== null &&
      'id' in entry &&
      'label' in entry &&
      'password' in entry
    ) {
      const e = entry as Record<string, unknown>;
      validEntries.push({
        id: String(e.id),
        label: String(e.label),
        password: String(e.password),
        strength:
          typeof e.strength === 'number'
            ? e.strength
            : calculateStrength(String(e.password)).score,
        createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(),
        lastModified:
          e.lastModified instanceof Date ? e.lastModified : new Date(),
        expiresAt: e.expiresAt instanceof Date ? e.expiresAt : undefined,
      });
    }
  }

  if (validEntries.length === 0) {
    throw new ImportError('No valid password entries found');
  }

  let imported = 0;
  let skipped = 0;

  if (merge) {
    const existing = readPasswords();
    const existingIds = new Set(existing.map((p) => p.id));

    for (const entry of validEntries) {
      if (existingIds.has(entry.id)) {
        skipped++;
      } else {
        existing.push(entry);
        imported++;
      }
    }

    writePasswords(existing);
  } else {
    writePasswords(validEntries);
    imported = validEntries.length;
  }

  return { imported, skipped };
}
