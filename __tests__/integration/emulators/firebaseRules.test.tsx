// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import fs from 'fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment, EmulatorConfig } from '@firebase/rules-unit-testing';
import { describeWithEmulator, initializeTestEnv, shouldRunTests, teardownTestEnv } from "../../utils/emulatorTools";
import * as firebaseRules from '../../../firebase.json';
import { FeedbackProps } from '@src/types/database';

const projectId = process.env.TEST_PROJECT_ID;
if (!projectId) throw new Error(`Missing environment variable ${projectId}.`);

describeWithEmulator('Test firebase rules emulator connection', () => {
    let testEnv: RulesTestEnvironment;
    let testId: string;

    beforeAll(async () => {
        const emulatorConfig = {
            host: 'localhost',
            port: parseInt(firebaseRules.emulators.database.port),
            rules: fs.readFileSync("database.rules.json", "utf8"),
        };

        testEnv = await initializeTestEnvironment({
            projectId: projectId,
            database: emulatorConfig,
        });
    });

    afterEach(async () => {
        await testEnv.clearDatabase();
    });

    afterAll(async () => {
        await testEnv.clearDatabase();
        await testEnv.cleanup();
    });
    it('should succeed with an authentificated user transaction', async () => {
        // expect(1).toBe(1);
        const alice = testEnv.authenticatedContext('alice');
        await assertSucceeds(alice.database().ref('/private/doc').set({ key: 'value' }));
    });

    it('should fail with an unauthentificated user transaction', async () => {
        // expect(1).toBe(1);
        const unauthed = testEnv.unauthenticatedContext();
        await assertFails(unauthed.database().ref('/private/doc').set({ key: 'value' }));
    });

    it('should do something', async () => {
        // expect(1).toBe(1);
        let testId = 'testId';
        let testDb = testEnv.authenticatedContext(testId).database();
        await assertFails(testDb.ref("/some/path").set({ foo: "bar" }));
        await assertSucceeds(testDb.ref("/another/path").set({ foo: "bar" }));
    });
});

// describeWithEmulator('Test feedback rules', () => {
//     let testEnv: RulesTestEnvironment;
//     let testId: string;

//     beforeAll(async () => {
//         testEnv = await initializeTestEnv();
//     });

//     afterEach(async () => {
//         await testEnv.clearDatabase();
//     });

//     afterAll(async () => {
//         await teardownTestEnv(testEnv);
//     });

//     it('unauthenticated user can not write feedback', async () => {
//         const testDb = testEnv.unauthenticatedContext().database();
//         const testFeedbackId = 'testFeedbackId';
//         const testFeedback:FeedbackProps = {
//             submit_time: 0,
//             text: 'test',
//             user_id: 'testId',
//         }
//         const testRef = testDb.ref(`feedback/${testFeedbackId}`);
//         await assertFails(testRef.set(testFeedback));
//     });

// });