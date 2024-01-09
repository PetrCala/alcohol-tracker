import fs from 'fs';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as firebaseJson from '../../../firebase.json';

export async function setupFirebaseRulesTestEnv(): Promise<RulesTestEnvironment> {
  const projectId = process.env.TEST_PROJECT_ID;
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

  return testEnv;
}

export async function teardownFirebaseRulesTestEnv(
  testEnv: RulesTestEnvironment,
): Promise<void> {
  await testEnv.clearDatabase();
  await testEnv.cleanup();
}
