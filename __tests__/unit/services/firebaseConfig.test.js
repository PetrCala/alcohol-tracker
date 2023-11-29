const { initializeApp } = require('firebase/app');
const { connectAuthEmulator } = require('firebase/auth');

// Mocking Firebase modules and AsyncStorage
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn(),
    connectAuthEmulator: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({}));

// Helper function to set environment variables
const setEnvironmentVariables = (env) => {
    process.env.NODE_ENV = env.NODE_ENV;
    process.env.USE_EMULATORS = env.USE_EMULATORS;
    process.env.FIREBASE_AUTH_EMULATOR_HOST;
    process.env.API_KEY = env.API_KEY;
    process.env.AUTH_DOMAIN = env.AUTH_DOMAIN;
    process.env.DATABASE_URL = env.DATABASE_URL;
    process.env.PROJECT_ID = env.PROJECT_ID;
    process.env.STORAGE_BUCKET = env.STORAGE_BUCKET;
    process.env.MESSAGING_SENDER_ID = env.MESSAGING_SENDER_ID;
    process.env.APP_ID = env.APP_ID;
    process.env.MEASUREMENT_ID = env.MEASUREMENT_ID;
};

// Reset environment variables and mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    setEnvironmentVariables({
        NODE_ENV: 'development',
        USE_EMULATORS: 'false',
        FIREBASE_AUTH_EMULATOR_HOST: 'test-emulator-host',
        API_KEY: 'test-api-key',
        AUTH_DOMAIN: 'test-auth-domain',
        DATABASE_URL: 'test-database-url',
        PROJECT_ID: 'test-project-id',
        STORAGE_BUCKET: 'test-storage-bucket',
        MESSAGING_SENDER_ID: 'test-sender-id',
        APP_ID: 'test-app-id',
        MEASUREMENT_ID: 'test-measurement-id'
    });
});


describe('Firebase Configuration', () => {
    it('should initialize Firebase with correct configuration in development environment', () => {
        // Import the configuration module
        require('../../../src/services/firebaseConfig')

        // Check if Firebase has been initialized with the correct parameters
        expect(initializeApp).toHaveBeenCalledWith({
            apiKey: 'test-api-key',
            authDomain: 'test-auth-domain',
            databaseURL: 'test-database-url',
            projectId: 'test-project-id',
            storageBucket: 'test-storage-bucket',
            messagingSenderId: 'test-sender-id',
            appId: 'test-app-id',
            measurementId: 'test-measurement-id'
        });

        // Verify that the auth emulator is not connected in development
        expect(connectAuthEmulator).not.toHaveBeenCalled();
    });

    it('should connect to auth emulator in test environment', () => {
        // Set environment to test
        setEnvironmentVariables({
            ...process.env,
            NODE_ENV: 'test',
            USE_EMULATORS: 'true',
            FIREBASE_AUTH_EMULATOR_HOST: 'test-emulator-host:9999',
        });

        // Import the configuration module
        require('../../../src/services/firebaseConfig')

        // Check if the auth emulator connection is attempted
        expect(connectAuthEmulator).toHaveBeenCalled();
    });

});
