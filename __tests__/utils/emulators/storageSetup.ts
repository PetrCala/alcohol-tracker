require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {initializeApp, deleteApp, FirebaseApp} from 'firebase/app';
import * as firebaseJson from '../../../firebase.json';
import {
  FirebaseStorage,
  connectStorageEmulator,
  getStorage,
} from 'firebase/storage';
import CONFIG from '../../../src/CONFIG';
import {getTestStorageBucket} from './emulatorUtils';

export function setupStorageTestEnv(): {
  testApp: FirebaseApp;
  storage: FirebaseStorage;
} {
  const storageBucket = getTestStorageBucket();
  const projectId = CONFIG.TEST_PROJECT_ID;

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
