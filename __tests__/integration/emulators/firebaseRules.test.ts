// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {describeWithEmulator} from '../../utils/emulators/emulatorTools';
import {
  setupFirebaseRulesTestEnv,
  teardownFirebaseRulesTestEnv,
} from '../../utils/emulators/firebaseRulesSetup';
import {FeedbackProps} from '@src/types/database';
import {setupGlobalMocks} from '../../utils/testUtils';
import { createMockSession } from '../../utils/mockDatabase';
import exp from 'constants';

const projectId = process.env.TEST_PROJECT_ID;
if (!projectId) throw new Error(`Missing environment variable ${projectId}.`);

const testFeedbackId: string = 'testFeedbackId';
const testFeedback: FeedbackProps = {
  submit_time: 0,
  text: 'test',
  user_id: 'testId',
};
const authUserId = 'authUserId';
const otherUserId = 'otherUserId';

describeWithEmulator('Test drinking session rules', () => {
  let testEnv: RulesTestEnvironment;
  let authDb: any; // firebase.database.Database
  let unauthDb: any; // firebase.database.Database
  let adminDb: any;
  setupGlobalMocks(); // Silence permission denied warnings

  beforeAll(async () => {
    ({testEnv, authDb, unauthDb, adminDb} = await setupFirebaseRulesTestEnv());
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await teardownFirebaseRulesTestEnv(testEnv);
  });

  it('should allow admins to write into the drinking sessions node', async () => {
    const adminRef = adminDb.ref(`user_drinking_sessions/${testFeedbackId}`);
    await assertSucceeds(adminRef.set(testFeedback));
  });

  it('should not allow authenticated user to write into the drinking sessions node', async () => {
    const authRef = authDb.ref(`user_drinking_sessions/${testFeedbackId}`);
    await assertFails(authRef.set(testFeedback));
  });

  it('should not allow unauthenticated user to write into the drinking sessions node', async () => {
    const unauthRef = unauthDb.ref(`user_drinking_sessions/${testFeedbackId}`);
    await assertFails(unauthRef.set(testFeedback));
  });

  it('should allow admins to read into the drinking sessions node', async () => {
    const adminRef = adminDb.ref(`user_drinking_sessions/${testFeedbackId}`);
    await assertSucceeds(adminRef.get(testFeedback));
  });

  it('should not allow authenticated user to read into the drinking sessions node', async () => {
    const authRef = authDb.ref(`user_drinking_sessions/${testFeedbackId}`);
    await assertFails(authRef.get(testFeedback));
  });

  it('should not allow unauthenticated user to read into the drinking sessions node', async () => {
    const unauthRef = unauthDb.ref(`user_drinking_sessions/${testFeedbackId}`);
    await assertFails(unauthRef.get(testFeedback));
  });

  it('should allow the user themselves to write into their own data', async () => {
    const authRef = authDb.ref(`user_drinking_sessions/${authUserId}`);
    const mockDrinkingSession = createMockSession(new Date);
    await assertSucceeds(authRef.set(mockDrinkingSession));
  });

  it('should not allow a user to write into other user\'s data', async () => {
    const authRef = authDb.ref(`user_drinking_sessions/${otherUserId}`);
    const mockDrinkingSession = createMockSession(new Date);
    await assertFails(authRef.set(mockDrinkingSession));
  });

  it('should allow the user to read their own drinking session data', async () => {
    const authRef = authDb.ref(`user_drinking_sessions/${authUserId}`);
    await assertSucceeds(authRef.get());
  });

  it('should allow a user to read friend\'s drinking session data', async () => {
    // Set the friend connection first
    const friendRef = authDb.ref(`users/${authUserId}/friends/${otherUserId}`)
    await friendRef.set(true);

    const authRef = authDb.ref(`user_drinking_sessions/${otherUserId}`);
    await assertSucceeds(authRef.get());
  });

  it('should not allow a user to drinking session data of a non-friend', async () => {
    const authRef = authDb.ref(`user_drinking_sessions/${otherUserId}`);
    await assertFails(authRef.get());
  });

});

describeWithEmulator('Test user preferences rules', () => {
  let testEnv: RulesTestEnvironment;
  let authDb: any; // firebase.database.Database
  let unauthDb: any; // firebase.database.Database
  let adminDb: any;
  setupGlobalMocks(); // Silence permission denied warnings

  beforeAll(async () => {
    ({testEnv, authDb, unauthDb, adminDb} = await setupFirebaseRulesTestEnv());
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await teardownFirebaseRulesTestEnv(testEnv);
  });

  it('does something', () => {
    expect(true).toBe(true);
  });

});

describeWithEmulator('Test feedback rules', () => {
  let testEnv: RulesTestEnvironment;
  let authDb: any;
  let unauthDb: any;
  let adminDb: any;
  setupGlobalMocks(); // Silence permission denied warnings

  beforeAll(async () => {
    ({testEnv, authDb, unauthDb, adminDb} = await setupFirebaseRulesTestEnv());
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await teardownFirebaseRulesTestEnv(testEnv);
  });

  it('should write feedback when authorized', async () => {
    const authRef = authDb.ref(`feedback/${testFeedbackId}`);
    await assertSucceeds(authRef.set(testFeedback));
  });

  it('should not write feedback when unauthorized', async () => {
    const unauthRef = unauthDb.ref(`feedback/${testFeedbackId}`);
    await assertFails(unauthRef.set(testFeedback));
  });

  it('should allow reading feedback when admin is true', async () => {
    const authRef = adminDb.ref(`feedback/${testFeedbackId}`);
    await assertSucceeds(authRef.get());
  });

  it('should not read feedback when not an admin', async () => {
    const unauthRef = unauthDb.ref(`feedback/${testFeedbackId}`);
    await assertFails(unauthRef.get());
  });
});

describeWithEmulator('Test friend rules', () => {
  let testEnv: RulesTestEnvironment;
  let authDb: any;
  let unauthDb: any;
  let adminDb: any;
  setupGlobalMocks(); // Silence permission denied warnings

  beforeAll(async () => {
    ({testEnv, authDb, unauthDb, adminDb} = await setupFirebaseRulesTestEnv());
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await teardownFirebaseRulesTestEnv(testEnv);
  });

  it('should allow a user to write valid values into their own friend list', async () => {
    const authRef = authDb.ref(`users/authUserId/friends/otherUserId`);
    await assertSucceeds(authRef.set(true));
    await assertSucceeds(authRef.set(null));
  });

  it("should allow a user to write valid values into other user's friend list", async () => {
    const authRef = authDb.ref(`users/otherUserId/friends/authUserId`);
    await assertSucceeds(authRef.set(true));
    await assertSucceeds(authRef.set(null));
  });

  it('should not allow a user to write their own name into their friend list', async () => {
    const authRef = authDb.ref(`users/authUserId/friends/authUserId`);
    await assertFails(authRef.set(true));
  });

  it('should not allow writing invalid values into their friend list', async () => {
    const authRef = authDb.ref(`users/authUserId/friends/otherUserId`);
    await assertFails(authRef.set('invalid'));
  });

  it("should not allow writing invalid values into other user's friend list", async () => {
    const authRef = authDb.ref(`users/otherUserId/friends/authUserId`);
    await assertFails(authRef.set('invalid'));
  });

  it('should allow reading own friend list when authenticated', async () => {
    const authRef = authDb.ref(`users/authUserId/friends`);
    await assertSucceeds(authRef.get());
  });

  it('should not allow reading own friend list when unauthenticated', async () => {
    const unauthRef = unauthDb.ref(`users/authUserId/friends`);
    await assertFails(unauthRef.get());
  });
});

describeWithEmulator('Test friend request rules', () => {
  let testEnv: RulesTestEnvironment;
  let authDb: any;
  let unauthDb: any;
  let adminDb: any;
  setupGlobalMocks(); // Silence permission denied warnings

  beforeAll(async () => {
    ({testEnv, authDb, unauthDb, adminDb} = await setupFirebaseRulesTestEnv());
  });

  afterEach(async () => {
    await testEnv.clearDatabase();
  });

  afterAll(async () => {
    await teardownFirebaseRulesTestEnv(testEnv);
  });

  it('should allow authenticated user to write into their own friend_requests with valid values', async () => {
    const authRef = authDb.ref(
      `users/${authUserId}/friend_requests/${otherUserId}`,
    );
    await assertSucceeds(authRef.set('sent'));
    await assertSucceeds(authRef.set(null));
  });

  it('should not allow authenticated user to write into their own friend_requests with invalid values', async () => {
    const authRef = authDb.ref(
      `users/${authUserId}/friend_requests/${otherUserId}`,
    );
    await assertFails(authRef.set(123));
    await assertFails(authRef.set('rejected'));
  });

  it("should allow authenticated user to write into other user's friend_requests with their own id", async () => {
    const authRef = authDb.ref(
      `users/${otherUserId}/friend_requests/${authUserId}`,
    );
    await assertSucceeds(authRef.set('received'));
    await assertSucceeds(authRef.set(null));
  });

  it("should not allow authenticated user to write into other user's friend_requests with different id", async () => {
    const authRef = authDb.ref(
      `users/${otherUserId}/friend_requests/${otherUserId}`,
    );

    // Attempt to write under different id into the other user's friend_requests database part
    await assertFails(authRef.set('received'));
  });

  it("should not allow authenticated user to write into other user's friend_requests any value other than received", async () => {
    const authRef = authDb.ref(
      `users/${otherUserId}/friend_requests/${authUserId}`,
    );
    await assertFails(authRef.set(123));
    await assertFails(authRef.set('sent'));
  });

  it('should not allow writing invalid values to friend_requests node', async () => {
    const authRef = authDb.ref(`users/${authUserId}/friend_requests`);
    await assertFails(authRef.set(123));
    await assertFails(authRef.set(true));
  });

  it('should allow writing valid values to own friend_requests node', async () => {
    const authRef = authDb.ref(`users/${authUserId}/friend_requests`);
    await assertSucceeds(authRef.set(null));
  });

  it('should not allow writing valid values to other friend_requests node', async () => {
    const authRef = authDb.ref(`users/${otherUserId}/friend_requests`);
    await assertFails(authRef.set(null));
  });

  it('should not allow the user to write their own name into their friend_requests', async () => {
    const authRef = authDb.ref(
      `users/${authUserId}/friend_requests/${authUserId}`,
    );
    await assertFails(authRef.set('sent'));
  });

  it('should allow reading own friend_requests when authenticated', async () => {
    const authRef = authDb.ref(`users/${authUserId}/friend_requests`);
    await assertSucceeds(authRef.get());
  });

  it('should not allow reading own friend_requests when unauthenticated', async () => {
    const unauthRef = unauthDb.ref(`users/${authUserId}/friend_requests`);
    await assertFails(unauthRef.get());
  });

  it("should not allow reading other people's friend requests", async () => {
    const authDb = testEnv.authenticatedContext(authUserId).database();
    const authRef = authDb.ref(`users/${otherUserId}/friend_requests`);
    await assertFails(authRef.get());
  });
});

// TODO
// Test out beta keys, config, rest of the rules
// Make an explicit list of opperations the user can do (has to do) before being authenticated
