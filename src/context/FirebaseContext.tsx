import 'dotenv/config'
import { ReactNode, createContext, useContext } from 'react';
import { Database, connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { FirebaseStorage, getStorage, connectStorageEmulator } from 'firebase/storage';
import { FirebaseApp } from 'firebase/app';


type FirebaseContextProps = {
    db: Database;
    storage: FirebaseStorage;
};

const FirebaseContext = createContext<FirebaseContextProps|null>(null);

/** Fetch the FirebaseContext. If the context does not exist, throw an error.
 * 
 * @example { db, storage } = useFirebase();
 */
export const useFirebase = (): FirebaseContextProps => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("firebaseContext must be used within a FirebaseContextProvider");
    };
    return context;
};

type FirebaseProviderProps = {
    app: FirebaseApp;
    children: ReactNode;
}

/** Provide a firebase context to the application
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ 
    app,
    children, 
}) => {
    const db = getDatabase(app);
    const storage = getStorage(app);

    // Check if emulators should be used
    if (process.env.NODE_ENV === 'test' || process.env.USE_EMULATORS === 'true') {
      var database_host = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
      var storage_host = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
      if (database_host && storage_host) {
        const [dbHost, dbPort] = database_host.split(':');
        const [storageHost, storagePort] = storage_host.split(':');
    
        connectDatabaseEmulator(db, dbHost, parseInt(dbPort));
        connectStorageEmulator(storage, storageHost, parseInt(storagePort));
      } else {
        throw new Error("Could not connect to the database. Unspecified environmental variables FIREBASE_DATABASE_EMULATOR_HOST or FIREBASE_STORAGE_EMULATOR_HOST.")
      }
    }
  
    return (
      <FirebaseContext.Provider value={{db, storage}} >
        {children}
      </FirebaseContext.Provider>
    );
};
