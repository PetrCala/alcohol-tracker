require('dotenv').config(); // for the process.env variables to read the .env file
import fs from 'fs';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as firebaseRules from '../../firebase.json';

import CONST from '@src/CONST';

// Perhaps if this grows too largs, rewrite into a module export
export const shouldRunTests = process.env.APP_ENVIRONMENT === CONST.ENVIRONMENT.TEST;
export const describeWithEmulator = shouldRunTests ? describe : describe.skip;


export async function initializeTestEnv():Promise<RulesTestEnvironment> {
    const projectId = process.env.TEST_PROJECT_ID;
    if (!projectId) {
        throw new Error('Missing environment variable TEST_PROJECT_ID.');
    }

    const emulatorConfig = {
        host: 'localhost',
        port: parseInt(firebaseRules.emulators.database.port),
        rules: fs.readFileSync("database.rules.json", "utf8"),
    };

    return await initializeTestEnvironment({
        projectId: projectId,
        database: emulatorConfig,
    });
}

export async function teardownTestEnv(testEnv: RulesTestEnvironment) {
    await testEnv.clearDatabase();
    await testEnv.cleanup();
};