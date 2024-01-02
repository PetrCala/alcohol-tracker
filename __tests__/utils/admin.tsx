// import Config from 'react-native-config';
const admin = require('firebase-admin');
const serviceAccount = require('../../alcohol-tracker-db-firebase-adminsdk-nsgbc-52a51fdabc.json');

// const isTestEnv = process.env.NODE_ENV === 'test'|| Config.USE_EMULATORS === 'true'; // TODO
const isTestEnv = true; // TODO
if (!isTestEnv) {
    console.log('This script should only be run in test environment.');
    process.exit(1);
}

// Initialize the app with a service account and the database URL
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: Config.TEST_DATABASE_URL,
    // projectId: Config.TEST_PROJECT_ID,
    projectId: 'alcohol-tracker-db', // TODO modify this to the config file
});

export default admin;