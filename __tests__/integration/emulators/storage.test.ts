// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {FirebaseStorage} from 'firebase/storage';
import {FirebaseApp} from 'firebase/app';
import {isConnectedToStorageEmulator} from '../../../src/services/firebaseUtils';
import {describeWithEmulator} from '../../utils/emulators/emulatorTools';
import { setupStorageTestEnv, teardownStorageTestEnv } from '../../utils/emulators/storageSetup';

const storageBucket = process.env.TEST_STORAGE_BUCKET;
const projectId = process.env.TEST_PROJECT_ID;
if (!storageBucket || !projectId) {
  throw new Error(
    `Missing environment variables ${storageBucket} or ${projectId} for storage emulator`,
  );
}

describeWithEmulator('Test connecting to the storage emulator', () => {
  let testApp: FirebaseApp;
  let storage: FirebaseStorage;

  beforeAll(async () => {
    ({testApp, storage} = setupStorageTestEnv());
  });

  beforeEach(async () => {
    // do something
  });

  afterEach(async () => {
    // do something
  });

  afterAll(async () => {
    await teardownStorageTestEnv(testApp);
  });

  it('should connect to the emulator storage', async () => {
    expect(storage).not.toBeNull();
    expect(isConnectedToStorageEmulator(storage)).toBe(true);
  });

});

describeWithEmulator('Test uploading objects', () => {
  let testApp: FirebaseApp;
  let storage: FirebaseStorage;

  beforeAll(async () => {
    ({testApp, storage} = setupStorageTestEnv());
  });

  beforeEach(async () => {
    // do something
  });

  afterEach(async () => {
    // do something
  });

  afterAll(async () => {
    await teardownStorageTestEnv(testApp);
  });

  it('should connect to the emulator storage', async () => {
    expect(storage).not.toBeNull();
    expect(isConnectedToStorageEmulator(storage)).toBe(true);
  });

});
