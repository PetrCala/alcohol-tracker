// Create and export the admin logged database object

const admin = require('firebase-admin');
var serviceAccount = require('../../alcohol-tracker-db-firebase-adminsdk-nsgbc-52a51fdabc.json');
import CONST from '@src/CONST';
import CONFIG from '@src/CONFIG';

const isTestEnv = process.env.NODE_ENV === 'test'|| CONFIG.APP_ENVIRONMENT === CONST.ENVIRONMENT.TEST;
const databaseURL = isTestEnv ? CONFIG.DB_CONFIG_TEST.databaseURL : CONFIG.DB_CONFIG_PROD.databaseURL;

// Initialize the app with a service account and the database URL
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

export default admin;