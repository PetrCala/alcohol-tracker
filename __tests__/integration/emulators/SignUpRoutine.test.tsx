// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config
// This test suite simulates a complete lifecycle of user creation and deletion
// All of this should run on an emulator suite to test the real-life behavior as close as possible without interacting with the production database

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import { getDatabase, connectDatabaseEmulator, ref, get, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import { createMockDatabase } from "../../utils/mockDatabase";
import { isConnectedToAuthEmulator, isConnectedToDatabaseEmulator, isConnectedToStorageEmulator } from "@src/services/firebaseUtils";
import { DatabaseProps } from "@src/types/database";
import { Database } from "firebase/database";
import CONST from '@src/CONST';

// Never run these tests outside of the emulator environment
const shouldRunTests = process.env.APP_ENVIRONMENT === CONST.ENVIRONMENT.TEST;

const describeWithEmulator = shouldRunTests ? describe : describe.skip;

describeWithEmulator('Create and delete a user in the emulated database', () => {
    let db: Database;
    let mockDatabase: DatabaseProps;

    beforeAll(async () => {
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
        expect(isConnectedToDatabaseEmulator(db)).toBe(true);
    });

    it('mock data should not be empty', async () => {
        async function getDatabaseRef() {
            var tempRef = ref(db, 'config');
            const snapshot = await get(tempRef); // One-off fetch
            return snapshot;
        }
        const data = await getDatabaseRef()
        expect(data.exists()).toBe(true);
        expect(data.val()).not.toBeNull();
    });
});