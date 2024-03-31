import Config from 'react-native-config';
import type {FirebaseStorage} from 'firebase/storage';
import type {Database} from 'firebase/database';
import type {Auth} from 'firebase/auth';
import CONFIG from '@src/CONFIG';

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
    `${CONFIG.TEST_HOST}:${CONFIG.TEST_STORAGE_BUCKET_PORT}`,
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
  return authConfig.includes(`${CONFIG.TEST_HOST}:${CONFIG.TEST_AUTH_PORT}`);
}

/**
 * Checks if the Firebase Realtime Database instance is connected to an emulator.
 *
 * @param database The Firebase Database instance.
 * @returns True if connected to the emulator, false otherwise.
 */
function isConnectedToDatabaseEmulator(database: Database): boolean {
  const dbConfig = database.app.options.databaseURL;
  if (!dbConfig) {
    return false;
  }
  return dbConfig.includes(`${CONFIG.TEST_HOST}:${CONFIG.TEST_AUTH_PORT}`);
}

export {
  isConnectedToAuthEmulator,
  isConnectedToDatabaseEmulator,
  isConnectedToStorageEmulator,
};
