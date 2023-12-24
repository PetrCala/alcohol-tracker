// Create and export the admin logged database object

import Config from 'react-native-config';

import * as admin from 'firebase-admin'
var serviceAccount = require('../../alcohol-tracker-db-firebase-adminsdk-nsgbc-52a51fdabc.json');

var databaseURL = Config.DATABASE_URL;

// Initialize the app with a service account and the database URL
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

export default admin;