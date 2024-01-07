// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
  EmulatorConfig,
} from '@firebase/rules-unit-testing';
import {
  describeWithEmulator,
  teardownFirebaseRulesTestEnv,
  shouldRunTests,
  setupFirebaseRulesTestEnv,
} from '../../utils/emulators/emulatorTools';
import * as firebaseJson from '../../../firebase.json';
import {FeedbackProps} from '@src/types/database';
import {setupGlobalMocks} from '../../utils/testUtils';

const projectId = process.env.TEST_PROJECT_ID;
if (!projectId) throw new Error(`Missing environment variable ${projectId}.`);

const testFeedbackId: string = 'testFeedbackId';
const testFeedback: FeedbackProps = {
  submit_time: 0,
  text: 'test',
  user_id: 'testId',
};
const authUserId = 'authUserId';
const unauthUserId = 'unauthUserId';
const otherUserId = 'otherUserId';

describeWithEmulator('Test feedback rules', () => {
  let testEnv: RulesTestEnvironment;
  setupGlobalMocks(); // Silence permission denied warnings

  beforeAll(async () => {
    testEnv = await setupFirebaseRulesTestEnv();
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await teardownFirebaseRulesTestEnv(testEnv);
  });

  it('should write feedback when authorized', async () => {
    const authDb = testEnv.authenticatedContext(testFeedbackId).database();
    const authRef = authDb.ref(`feedback/${testFeedbackId}`);
    await assertSucceeds(authRef.set(testFeedback));
  });

  it('should not write feedback when unauthorized', async () => {
    const unauthDb = testEnv.unauthenticatedContext().database();
    const unauthRef = unauthDb.ref(`feedback/${testFeedbackId}`);
    await assertFails(unauthRef.set(testFeedback));
  });

  it('should allow reading feedback when admin is true', async () => {
    const authDb = testEnv
      .authenticatedContext(testFeedbackId, {
        admin: true,
      })
      .database();
    const authRef = authDb.ref(`feedback/${testFeedbackId}`);
    await assertSucceeds(authRef.get());
  });

  it('should not read feedback when not an admin', async () => {
    const unauthDb = testEnv.unauthenticatedContext().database();
    const unauthRef = unauthDb.ref(`feedback/${testFeedbackId}`);
    await assertFails(unauthRef.get());
  });
});

describeWithEmulator('Test friend request rules', () => {
  let testEnv: RulesTestEnvironment;
  setupGlobalMocks();

  beforeAll(async () => {
    testEnv = await setupFirebaseRulesTestEnv();
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await teardownFirebaseRulesTestEnv(testEnv);
  });

  it('should allow authenticated user to write into their own friend_requests with valid values', async () => {
    // Set up the authenticated user context
    const authDb = testEnv.authenticatedContext(authUserId).database();
    const authRef = authDb.ref(
      `users/${authUserId}/friends/friend_requests/${otherUserId}`,
    );

    // Allow only 'sent' or null values to be written into the user's own friend_requests database part
    await assertSucceeds(authRef.set('sent'));
    await assertSucceeds(authRef.set(null));
  });

  it('should not allow authenticated user to write into their own friend_requests with invalid values', async () => {
    // Set up the authenticated user context
    const authDb = testEnv.authenticatedContext(authUserId).database();
    const authRef = authDb.ref(
      `users/${authUserId}/friends/friend_requests/${otherUserId}`,
    );

    // Attempt to write invalid values into the user's own friend_requests database part
    await assertFails(authRef.set(123));
    await assertFails(authRef.set('rejected'));
  });

  it("should allow authenticated user to write into other user's friend_requests with their own id", async () => {
    // Set up the authenticated user context
    const authDb = testEnv.authenticatedContext(authUserId).database();
    const authRef = authDb.ref(
      `users/${otherUserId}/friends/friend_requests/${authUserId}`,
    );

    // Attempt to write the authenticated user's id into the other user's friend_requests database part
    await assertSucceeds(authRef.set('received'));
    await assertSucceeds(authRef.set(null));
  });

  it("should not allow authenticated user to write into other user's friend_requests with different id", async () => {
    // Set up the authenticated user context
    const authDb = testEnv.authenticatedContext(authUserId).database();
    const authRef = authDb.ref(
      `users/${otherUserId}/friends/friend_requests/someOtherUserId`,
    );

    // Attempt to write under different id into the other user's friend_requests database part
    await assertFails(authRef.set('received'));
  });

  it("should not allow authenticated user to write into other user's friend_requests any value other than received", async () => {
    // Set up the authenticated user context
    const authDb = testEnv.authenticatedContext(authUserId).database();
    const authRef = authDb.ref(
      `users/${otherUserId}/friends/friend_requests/${authUserId}`,
    );

    // Fail any other write into the other user's friend_requests database part than 'received'
    await assertFails(authRef.set(123));
    await assertFails(authRef.set('sent'));
  });

  // it('should allow reading friend_requests when authenticated', async () => {
  //   // Set up the authenticated user context
  //   const authDb = testEnv.authenticatedContext(authUserId).database();
  //   const authRef = authDb.ref(`users/${authUserId}/friends/friend_requests/${otherUserId}`);

  //   // Attempt to read the friend_requests database part
  //   await assertSucceeds(authRef.get());
  // });

  // it('should not allow authenticated user to write into other user\'s friend_requests', async () => {
  //   const authUserId = 'authUserId';
  //   const otherUserId = 'otherUserId';
  //   const requestId = 'requestId';

  //   // Set up the authenticated user context
  //   const authDb = testEnv.authenticatedContext(authUserId).database();
  //   const authRef = authDb.ref(`users/${otherUserId}/friends/friend_requests/${requestId}`);

  //   // Attempt to write into the other user's friend_requests database part
  //   await assertFails(authRef.set('sent'));
  // });
});

// Test out beta keys behavior
// Make an explicit list of opperations the user can do (has to do) before being authenticated
