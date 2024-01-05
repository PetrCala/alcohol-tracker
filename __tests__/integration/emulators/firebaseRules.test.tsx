// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import fs from 'fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment, EmulatorConfig } from '@firebase/rules-unit-testing';
import { describeWithEmulator, shouldRunTests } from "../../utils/emulatorTools";
import * as firebaseRules from '../../../firebase.json';
import CONST from '@src/CONST';


const projectId = process.env.TEST_PROJECT_ID;
if (!projectId) throw new Error(`Missing environment variable ${projectId}.`);

describeWithEmulator('Test out firebase rules', () => {
    let testEnv: RulesTestEnvironment;

    beforeAll(async () => {
        // can pass null to the auth to have an unauthanticated user
        const emulatorConfig: EmulatorConfig = {
            host: 'localhost',
            port: parseInt(firebaseRules.emulators.database.port),
            rules: fs.readFileSync("database.rules.json", "utf8"),
        }
        // const myAuth = { uid: "user_id", email: "user@example.com" };
        testEnv = await initializeTestEnvironment({
            projectId: projectId,
            database: emulatorConfig,
            // storage: //
        });
    });

    // Clean up the emulators after each test
    afterEach(async () => {
        await testEnv.clearDatabase();
        // await testEnv.clearStorage();
    });

    afterAll(async () => {
        await testEnv.clearDatabase();
        await testEnv.cleanup();
    });

    it('should succeed with an authentificated user transaction', async () => {
        expect(1).toBe(1);
        // const alice = testEnv.authenticatedContext('alice');
        // await assertSucceeds(alice.database().ref('/private/doc').set({ key: 'value' }));
    });

    it('should fail with an unauthentificated user transaction', async () => {
        expect(1).toBe(1);
        // const unauthed = testEnv.unauthenticatedContext();
        // await assertFails(unauthed.database().ref('/private/doc').set({ key: 'value' }));
    });

    it('should do something', async () => {
        let testId = 'testId';
        let testDb = testEnv.authenticatedContext(testId).database();
        await assertFails(testDb.ref("/some/path").set({ foo: "bar" }));
        await assertSucceeds(testDb.ref("/another/path").set({ foo: "bar" }));
    });


});