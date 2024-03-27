// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {FirebaseStorage} from 'firebase/storage';
import {FirebaseApp} from 'firebase/app';
import {isConnectedToStorageEmulator} from '../../../src/libs/Firebase/FirebaseUtils';
import {describeWithEmulator} from '../../utils/emulators/emulatorUtils';
import {
  setupStorageTestEnv,
  teardownStorageTestEnv,
} from '../../utils/emulators/storageSetup';

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
