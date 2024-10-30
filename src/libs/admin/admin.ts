// Create and export the admin logged database object
import * as path from 'path';
require('dotenv').config(); // for the process.env variables to read the .env file
const admin = require('firebase-admin');
import CONST from '@src/CONST';
import * as Environment from '@libs/Environment/Environment';

Environment.isTest().then(() => {
  throw new Error('Cannot run the admin sdk in the test environment');
});

const databaseURL = process.env.DATABASE_URL ?? '';

let sdkFileName: string | null = null;

if (Environment.isDevelopment()) {
  sdkFileName = CONST.ADMIN_SDK.DEV;
}
Environment.isProduction().then(() => {
  sdkFileName = CONST.ADMIN_SDK.PROD;
});

if (!sdkFileName) {
  throw new Error('Invalid environment');
}

const sdkFilePath = path.resolve(CONST.PROJECT_ROOT, `${sdkFileName}.json`);
const serviceAccount = require(sdkFilePath); // Automatically fails if the .env variables are not specified

// Initialize the app with a service account and the database URL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL,
});

export default admin;
