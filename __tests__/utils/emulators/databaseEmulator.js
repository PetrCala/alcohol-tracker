// import { getDatabase, connectDatabaseEmulator } from "firebase/database";

import firebase from "firebase/app";
import "firebase/database";

const app = firebase
    .initializeTestApp({
      projectId: "some-firestore-emulator",
      auth: {
        uid: "test-user",
        firebase: {
          sign_in_provider: "google.com"
        }   
      }
    })


var db = firebase.database(app);
db.useEmulator("127.0.0.1", 9001);

// // firebaseApps previously initialized using initializeApp()
// const db = getDatabase();
// connectDatabaseEmulator(db, '127.0.0.1', 9001);
