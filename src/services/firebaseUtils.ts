import Config from 'react-native-config';
import {FirebaseStorage} from 'firebase/storage';
import {Database} from 'firebase/database';
import {Auth} from 'firebase/auth';

/**
 * Extracts the host and port from the specified environment name.
 * @description Helper function.
 * @param {string} envName - The name of the environment.
 * @returns An array containing the host and port.
 * @throws Error if the emulator host is not specified in the Config object.
 */
export function extractHostAndPort(envName: string): [string, string] {
  const emulatorHost = Config[envName];
  if (!emulatorHost) {
    throw new Error(
      `Could not connect to the database. Unspecified environmental variables ${envName}.`,
    );
  }
  const regex = /https?:\/\/([^:/]+)(?::(\d+))?/;
  const match = emulatorHost.match(regex);
  if (match) {
    const host = match[1];
    const port = match[2];
    return [host, port];
  }
  throw new Error('Invalid URL format');
}

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
export function isConnectedToStorageEmulator(
  storage: FirebaseStorage,
): boolean {
  const storageConfig = storage.app.options.storageBucket;
  if (!storageConfig) return false;
  const [host, port] = extractHostAndPort('TEST_STORAGE_BUCKET');
  return storageConfig.includes(`${host}:${port}`);
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
export function isConnectedToAuthEmulator(auth: Auth): boolean {
  const authConfig = auth.app.options.authDomain;
  if (!authConfig) return false;
  const [host, port] = extractHostAndPort('TEST_AUTH_DOMAIN');

  return authConfig.includes(`${host}:${port}`);
}

/**
 * Checks if the Firebase Realtime Database instance is connected to an emulator.
 *
 * @param database The Firebase Database instance.
 * @returns True if connected to the emulator, false otherwise.
 */
export function isConnectedToDatabaseEmulator(database: Database): boolean {
  const dbConfig = database.app.options.databaseURL;
  if (!dbConfig) return false;

  const [host, port] = extractHostAndPort('TEST_DATABASE_URL');

  return dbConfig.includes(`${host}:${port}`);
}
