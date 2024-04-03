// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

// TODO - remaining an error where 'getReactNativePersistence' is not a function
jest.mock('@react-native-async-storage/async-storage', () => ({}));

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import type {Auth} from 'firebase/auth';
import type {FirebaseApp} from 'firebase/app';
import {isConnectedToAuthEmulator} from '../../../src/libs/Firebase/FirebaseUtils';
import {describeWithEmulator} from '../../utils/emulators/emulatorUtils';
import {
  createMockAuthUsers,
  setupAuthTestEnv,
  teardownAuthTestEnv,
} from '../../utils/emulators/authSetup';

describeWithEmulator('Connect to the storage emulator', () => {
  let testApp: FirebaseApp;
  let auth: Auth;

  beforeAll(async () => {
    ({testApp, auth} = setupAuthTestEnv());
  });

  beforeEach(async () => {
    await createMockAuthUsers(auth);
  });

  afterEach(async () => {
    // do something
  });

  afterAll(async () => {
    await teardownAuthTestEnv(testApp);
  });

  it('should connect to the auth emulator', async () => {
    expect(auth).not.toBeNull();
    expect(isConnectedToAuthEmulator(auth)).toBe(true);
  });
});
