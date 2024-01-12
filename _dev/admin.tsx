// Create and export the admin logged database object

require('dotenv').config(); // for the process.env variables to read the .env file
const admin = require('firebase-admin');
import CONST from '../src/CONST';
import CONFIG from '../src/CONFIG';

const environment = process.env.APP_ENVIRONMENT; // From .env, could be null
if (!environment) {
  throw new Error('APP_ENVIRONMENT not set in .env file');
}

if (environment === CONST.ENVIRONMENT.TEST) {
  throw new Error('Cannot run the admin sdk in the test environment');
}

let databaseURL: string;
let sdkFileName: string;

if (environment === CONST.ENVIRONMENT.PROD) {
  databaseURL = CONFIG.DB_CONFIG_PROD.databaseURL;
  sdkFileName = CONFIG.ADMIN_SDK.PROD;
} else if (environment === CONST.ENVIRONMENT.DEV) {
  databaseURL = CONFIG.DB_CONFIG_DEV.databaseURL;
  sdkFileName = CONFIG.ADMIN_SDK.DEV;
} else {
  throw new Error('Invalid environment');
}

var serviceAccount = require(`../../${sdkFileName}.json`);

// Initialize the app with a service account and the database URL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL,
});

export default admin;
