import { ReactNode, createContext, useContext } from 'react';
import { Database, connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { FirebaseStorage, getStorage, connectStorageEmulator } from 'firebase/storage';
import { FirebaseApp } from 'firebase/app';
import { USE_EMULATORS, FIREBASE_DATABASE_EMULATOR_HOST, FIREBASE_STORAGE_EMULATOR_HOST } from '@env';


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
    if (USE_EMULATORS === 'true') {
      const [dbHost, dbPort] = FIREBASE_DATABASE_EMULATOR_HOST.split(':');
      const [storageHost, storagePort] = FIREBASE_STORAGE_EMULATOR_HOST.split(':');
  
      connectDatabaseEmulator(db, dbHost, parseInt(dbPort));
      connectStorageEmulator(storage, storageHost, parseInt(storagePort));
    }
  
    return (
      <FirebaseContext.Provider value={{db, storage}} >
        {children}
      </FirebaseContext.Provider>
    );
};