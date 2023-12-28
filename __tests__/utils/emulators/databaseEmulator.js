import { getDatabase, connectDatabaseEmulator } from "firebase/database";

// firebaseApps previously initialized using initializeApp()
const db = getDatabase();
connectDatabaseEmulator(db, '127.0.0.1', 9001);
