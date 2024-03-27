import fs from 'fs';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import CONFIG from '../../../src/CONFIG';
import * as firebaseJson from '../../../firebase.json';

interface TestEnvironmentResult {
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

  let testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: projectId,
    database: emulatorConfig,
  });

  let authDb: any = testEnv.authenticatedContext('authUserId').database();
  let unauthDb: any = testEnv.unauthenticatedContext().database();
  let adminDb: any = testEnv
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
