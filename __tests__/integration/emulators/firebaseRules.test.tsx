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
} from '../../utils/emulatorTools';
import * as firebaseRules from '../../../firebase.json';
import {FeedbackProps} from '@src/types/database';

const projectId = process.env.TEST_PROJECT_ID;
if (!projectId) throw new Error(`Missing environment variable ${projectId}.`);

describeWithEmulator('Test feedback rules', () => {
  let testEnv: RulesTestEnvironment;
  let testFeedbackId: string = 'testFeedbackId';
  let testFeedback: FeedbackProps = {
    submit_time: 0,
    text: 'test',
    user_id: 'testId',
  };

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
    const authDb = testEnv.authenticatedContext(testFeedbackId, {
      admin: true,
    }).database();
    const authRef = authDb.ref(`feedback/${testFeedbackId}`);
    await assertSucceeds(authRef.get());
  });

  it('should not read feedback when not an admin', async () => {
    const unauthDb = testEnv.unauthenticatedContext().database();
    const unauthRef = unauthDb.ref(`feedback/${testFeedbackId}`);
    await assertFails(unauthRef.get());
  });
});