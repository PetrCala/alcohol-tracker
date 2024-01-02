// !! Run using bun test
// This test suite simulates a complete lifecycle of user creation and deletion
// All of this should run on an emulator suite to test the real-life behavior as close as possible without interacting with the production database

import assert from "assert";

import Config from 'react-native-config';
const { getDatabase, connectDatabaseEmulator, ref, get, set } = require("firebase/database");
const { initializeApp } = require("firebase/app");
const { createMockDatabase } = require("../../utils/mockDatabase.tsx");
// const { isConnectedToAuthEmulator, isConnectedToStorageEmulator, isConnectedToDatabaseEmulator } = require("../../../src/services/firebaseUtils.tsx");
import { DatabaseProps } from "@src/types/database";
import { Database } from "firebase/database";

// Never run these tests outside of the emulator environment
const shouldRunTests = process.env.USE_EMULATORS === 'true';

const describeWithEmulator = shouldRunTests ? describe : describe.skip;

describeWithEmulator('Create and delete a user in the emulated database', () => {
    let db: Database;
    let mockDatabase: DatabaseProps;

    beforeAll(async () => {
        assert(shouldRunTests, 'Tests should run') // Extra safety check

        // Initialize the app and database
        const testApp = initializeApp({
            databaseURL: "https://localhost:9001/?ns=alcohol-tracker-db",
            projectId: 'alcohol-tracker-db', // TODO modify this to the config file
        });

        db = getDatabase(testApp);
        connectDatabaseEmulator(db, 'localhost', 9001);

        // Initialize the database with mock data
        mockDatabase = createMockDatabase();
    })

    // Set up the database before each test
    beforeEach(async () => {
        set(ref(db), mockDatabase);
    });

    // Write null to clear the database.
    afterEach(async () => {
        set(ref(db), null);
    });

    it('should connect to the emulator realtime database', async () => {
        expect(db).not.toBeNull();
        // expect(isConnectedToDatabaseEmulator(db)).toBe(true);
    });

    it('mock data should not be empty', async () => {
        async function getDatabaseRef() {
            var tempRef = ref(db, 'config');
            const snapshot = await get(tempRef); // One-off fetch
            expect(snapshot.exists()).toBe(true);
            expect(snapshot.val()).not.toBeNull();
        }
        await getDatabaseRef()
    });
});