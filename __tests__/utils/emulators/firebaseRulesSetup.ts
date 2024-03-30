import fs from 'fs';
import type {
  RulesTestEnvironment} from '@firebase/rules-unit-testing';
import {
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import CONFIG from '../../../src/CONFIG';
import * as firebaseJson from '../../../firebase.json';

type TestEnvironmentResult = {
  testEnv: RulesTestEnvironment;
  authDb: any;
  unauthDb: any;
  adminDb: any;
}

export async function setupFirebaseRulesTestEnv(): Promise<TestEnvironmentResult> {
  const projectId = CONFIG.TEST_PROJECT_ID;
  if (!projectId) {
    throw new Error('Missing environment variable TEST_PROJECT_ID.');
  }
  const emulatorConfig = {
    host: 'localhost',
    port: parseInt(firebaseJson.emulators.database.port),
    rules: fs.readFileSync('database.rules.json', 'utf8'),
  };

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: projectId,
    database: emulatorConfig,
  });

  const authDb: any = testEnv.authenticatedContext('authUserId').database();
  const unauthDb: any = testEnv.unauthenticatedContext().database();
  const adminDb: any = testEnv
    .authenticatedContext('authUserId', {admin: true})
    .database();

  return {testEnv, authDb, unauthDb, adminDb};
}

export async function teardownFirebaseRulesTestEnv(
  testEnv: RulesTestEnvironment,
): Promise<void> {
  await testEnv.clearDatabase();
  await testEnv.cleanup();
}
