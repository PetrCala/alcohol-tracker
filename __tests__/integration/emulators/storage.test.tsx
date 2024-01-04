// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import { getStorage, FirebaseStorage, ref } from 'firebase/storage';
import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import { isConnectedToStorageEmulator } from "@src/services/firebaseUtils";
import { describeWithEmulator } from "../../utils/emulatorTools";
import { connectStorageEmulator } from 'firebase/storage';
import * as firebaseRules from '../../../firebase.json';

const storageBucket = process.env.TEST_STORAGE_BUCKET;
const projectId = process.env.TEST_PROJECT_ID;
if (!storageBucket || !projectId) {
    throw new Error(`Missing environment variables ${storageBucket} or ${projectId} for storage emulator`);
};

describeWithEmulator('Connect to the storage emulator', () => {
    let testApp: FirebaseApp;
    let storage: FirebaseStorage;

    beforeAll(async () => {
        testApp = initializeApp({
            storageBucket: storageBucket,
            projectId: projectId,
        });

        storage = getStorage();
        const storagePort = parseInt(firebaseRules.emulators.database.port)
        connectStorageEmulator(storage, 'localhost', storagePort);
    })

    beforeEach(async () => {
        // do something
    });

    afterEach(async () => {
        // do something
    });

    afterAll(async () => {
        deleteApp(testApp); // Delete the app
    });

    it('should connect to the emulator storage', async () => {
        expect(storage).not.toBeNull();
        expect(isConnectedToStorageEmulator(storage)).toBe(true);
    });
});