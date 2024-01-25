require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {initializeApp, deleteApp, FirebaseApp} from 'firebase/app';
import * as firebaseJson from '../../../firebase.json';
import { FirebaseStorage, connectStorageEmulator, getStorage } from 'firebase/storage';

export function setupStorageTestEnv(): {
  testApp: FirebaseApp;
  storage: FirebaseStorage;
} {
  const storageBucket = process.env.TEST_STORAGE_BUCKET;
  const projectId = process.env.TEST_PROJECT_ID;

  if (!storageBucket) {
    throw new Error(
      `Missing environment variable TEST_STORAGE_BUCKET for storage emulator`,
    );
  }

  if (!projectId) {
    throw new Error(
      `Missing environment variable TEST_PROJECT_ID for storage emulator`,
    );
  }

  const testApp: FirebaseApp = initializeApp({
    storageBucket: storageBucket,
    projectId: projectId,
  });

  const storage = getStorage();
  const storagePort = parseInt(firebaseJson.emulators.database.port);
  connectStorageEmulator(storage, 'localhost', storagePort);

  return {testApp, storage};
}

export async function teardownStorageTestEnv(
  testApp: FirebaseApp,
): Promise<void> {
  await deleteApp(testApp); // Delete the app
}

export async function fillStorageWithMocks(
  storage: FirebaseStorage,
): Promise<void> {
  // TBA
}
