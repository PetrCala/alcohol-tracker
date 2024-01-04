// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import { getDatabase, connectDatabaseEmulator, ref, get, set, goOffline } from "firebase/database";
import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import { createMockDatabase } from "../../utils/mockDatabase";
import { isConnectedToDatabaseEmulator } from "@src/services/firebaseUtils";
import { DatabaseProps } from "@src/types/database";
import { Database } from "firebase/database";
import { describeWithEmulator } from "../../utils/emulatorTools";
import * as firebaseRules from '../../../firebase.json';

const databaseURL = process.env.TEST_DATABASE_URL;
const projectId = process.env.TEST_PROJECT_ID;
if (!databaseURL || !projectId) {
    throw new Error(`Missing environment variables ${databaseURL} or ${projectId} for storage emulator`);
};

describeWithEmulator('Connect to the realtime database emulator', () => {
    let testApp: FirebaseApp;
    let db: Database;
    let mockDatabase: DatabaseProps;

    beforeAll(async () => {
        testApp = initializeApp({
            databaseURL: databaseURL,
            projectId: projectId,
        });

        // Initialize the database
        db = getDatabase(testApp);
        const dbPort = parseInt(firebaseRules.emulators.database.port)
        connectDatabaseEmulator(db, 'localhost', dbPort);

        // Fill the database with mock data
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

    afterAll(async () => {
        goOffline(db); // Close database connection
        deleteApp(testApp); // Delete the app
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