import { STORAGE_KEYS } from './storage.ts';
import { DEFAULT_SETTINGS } from './settings.ts';

type MigrationFn = () => void;

const migrations: Record<number, MigrationFn> = {
  1: () => {
    // Initialize empty passwords array if not present
    if (!localStorage.getItem(STORAGE_KEYS.PASSWORDS)) {
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, '[]');
    }
  },

  2: () => {
    // Ensure expiresAt field exists — no-op since it's optional on PasswordEntry
  },

  3: () => {
    // Initialize settings with defaults if not present
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS),
      );
    }
  },
};

export async function runMigrations(currentVersion: number): Promise<number> {
  const migrationKeys = Object.keys(migrations)
    .map(Number)
    .sort((a, b) => a - b);

  for (const version of migrationKeys) {
    if (version > currentVersion) {
      migrations[version]!();
    }
  }

  const latestVersion = migrationKeys.length > 0 ? Math.max(...migrationKeys) : currentVersion;
  return Math.max(currentVersion, latestVersion);
}
