import type {FirebaseStorage} from 'firebase/storage';
import type {Auth} from 'firebase/auth';
import CONFIG from '@src/CONFIG';

/* eslint-disable @typescript-eslint/dot-notation */

/**
 * Checks if the Firebase Storage instance is connected to an emulator.
 *
 * @param storage The Firebase Storage instance.
 * @returns True if connected to the emulator, false otherwise.
 * @example
 * const storage = getStorage();
 * const connectedToStorageEmulator = isConnectedToStorageEmulator(storage);
 * console.log('Connected to Storage Emulator:', connectedToStorageEmulator);
 */
function isConnectedToStorageEmulator(storage: FirebaseStorage): boolean {
  const storageConfig = storage.app.options.storageBucket;
  if (!storageConfig) {
    return false;
  }
  return storageConfig.includes(
    `${CONFIG.EMULATORS.HOST}:${CONFIG.EMULATORS.STORAGE_BUCKET_PORT}`,
  );
}

/**
 * Checks if the Firebase Authentication instance is connected to an emulator.
 *
 * @param auth The Firebase Auth instance.
 * @returns True if connected to the emulator, false otherwise.
 * @example
 * const auth = getAuth();
 * const connectedToAuthEmulator = isConnectedToAuthEmulator(auth);
 * console.log('Connected to Auth Emulator:', connectedToAuthEmulator);
 */
function isConnectedToAuthEmulator(auth: Auth): boolean {
  const authConfig = auth.app.options.authDomain;
  if (!authConfig) {
    return false;
  }
  return authConfig.includes(
    `${CONFIG.EMULATORS.HOST}:${CONFIG.EMULATORS.AUTH_PORT}`,
  );
}

/**
 * Safely checks if the provided Firebase database instance is using an emulator.
 * @param database - A Firebase Database instance (or unknown).
 * @returns True if using emulator; otherwise, false.
 */
function isConnectedToDatabaseEmulator(database: unknown): boolean {
  if (typeof database !== 'object' || database === null) {
    return false;
  }

  const repoInternal = (database as Record<string, unknown>)['_repoInternal'];
  if (typeof repoInternal !== 'object' || repoInternal === null) {
    return false;
  }

  const repoInfo = (repoInternal as Record<string, unknown>)['repoInfo_'];
  if (typeof repoInfo !== 'object' || repoInfo === null) {
    return false;
  }

  const isUsingEmulator = (repoInfo as Record<string, unknown>)[
    'isUsingEmulator'
  ];
  return typeof isUsingEmulator === 'boolean' ? isUsingEmulator : false;
}

export {
  isConnectedToAuthEmulator,
  isConnectedToDatabaseEmulator,
  isConnectedToStorageEmulator,
};
