// TODO redo this to reflect the new .env

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


// ### Understanding Jest's Mocking and Module System

// 1. **Module Caching and Mocks**: When you mock a module in Jest using `jest.mock()`, Jest replaces the module's exports with mock functions or objects as specified in your mock definition. This happens before any test code runs. When you then `require` a module in your test file, you get the mocked version of the module.

// 2. **Why Re-import Inside Each Test**: The reason we re-import the modules (`firebase/app` and `firebase/auth`) inside each test case is due to the behavior of Jest's module caching system. Once a module is required, Jest caches it and subsequent `require` calls return the cached module. If your module reads environment variables at the top level (which is common for configuration modules), it will only read them once, when it's first required. By using `jest.resetModules()` in `beforeEach`, we clear this cache, ensuring that the next `require` call in a test reloads the module afresh, allowing it to read the updated environment variables.

// ### How Does This Not Invalidate the Mocks?

// - When you use `jest.mock()`, Jest replaces the real implementation of the module with your mock both in the module cache and in the module registry. 
// - The calls to `jest.resetModules()` and re-importing the modules within each test don't invalidate the mocks. They simply ensure that the module with the mocks is re-evaluated (re-run) in the context of the test. 
// - This means that when you `require` the modules again inside the test, you're still getting the mocked versions, but any top-level code inside those modules (like reading environment variables or performing initial setup) is executed again.

// ### Practical Example:

// - In your `firebaseConfig` file, you might have code that initializes Firebase based on the current environment variables. 
// - If this initialization code runs only once (the first time the module is imported) and you change environment variables in your tests, the changes won't be picked up unless the module is re-imported.
// - By resetting the module cache (`jest.resetModules()`) and then re-importing `firebaseConfig` and the mocked modules (`firebase/app` and `firebase/auth`) inside each test, you ensure that the initialization code in `firebaseConfig` runs with the correct, test-specific environment variables.

// In summary, the re-importing of modules after `jest.resetModules()` in each test ensures that your module logic, which may depend on different environment setups, is correctly executed for each test scenario, while still using the mocks defined for external dependencies.