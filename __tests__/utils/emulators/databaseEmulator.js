import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../src/services/firebaseConfig";

// import firebase from "firebase/app";
// import "firebase/database";


const app = initializeApp(firebaseConfig);

// var db = firebase.database(app);
// db.useEmulator("127.0.0.1", 9001);

// // firebaseApps previously initialized using initializeApp()
const db = getDatabase(app);
console.log(db);
// connectDatabaseEmulator(db, '127.0.0.1', 9001);

// console.log(db);
