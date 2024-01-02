const admin = require('firebase-admin');
const serviceAccount = require('../../alcohol-tracker-db-firebase-adminsdk-nsgbc-52a51fdabc.json');
const databaseURL = "https://alcohol-tracker-db-default-rtdb.europe-west1.firebasedatabase.app"

// Initialize the app with a service account and the database URL
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

export default admin;