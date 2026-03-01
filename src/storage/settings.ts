import type { AppSettings } from '@/types/index.ts';
import { STORAGE_KEYS } from './storage.ts';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  defaultGenerator: {
    length: 16,
    includeLowercase: true,
    includeNumerals: true,
    includeCapitals: true,
    includeSymbols: true,
    pronounceable: false,
    avoidAmbiguous: false,
    count: 1,
  },
  expirationReminders: true,
  defaultExpirationDays: 90,
  clipboardTimeout: 30000,
};

export function getDefaultSettings(): AppSettings {
  return structuredClone(DEFAULT_SETTINGS);
}

export async function getSettings(): Promise<AppSettings> {
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!raw) return getDefaultSettings();

  const stored = JSON.parse(raw) as Partial<AppSettings>;
  const defaults = getDefaultSettings();

  return {
    ...defaults,
    ...stored,
    defaultGenerator: {
      ...defaults.defaultGenerator,
      ...(stored.defaultGenerator ?? {}),
    },
  };
}

export async function updateSettings(
  updates: Partial<AppSettings>,
): Promise<void> {
  const current = await getSettings();

  const merged: AppSettings = {
    ...current,
    ...updates,
    defaultGenerator: {
      ...current.defaultGenerator,
      ...(updates.defaultGenerator ?? {}),
    },
  };

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
}

export async function resetSettings(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
