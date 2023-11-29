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
    Object.assign(process.env, env);
};

// Reset environment variables and mocks before each test
beforeEach(() => {
    jest.resetModules(); // Reset module registry
    jest.clearAllMocks(); // Clear all mocks
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
        // Dynamically import the configuration module
        require('../../../src/services/firebaseConfig');

        const { initializeApp } = require('firebase/app');
        
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

        const { connectAuthEmulator } = require('firebase/auth');
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

        const { connectAuthEmulator } = require('firebase/auth');
        // Check if the auth emulator connection is attempted
        expect(connectAuthEmulator).toHaveBeenCalled();
    });

});
