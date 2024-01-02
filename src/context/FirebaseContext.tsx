import Config from 'react-native-config';
import { ReactNode, createContext, useContext } from 'react';
import { Database, connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { FirebaseStorage, getStorage, connectStorageEmulator } from 'firebase/storage';
import { FirebaseApp } from 'firebase/app';
import { extractHostAndPort, isConnectedToDatabaseEmulator, isConnectedToStorageEmulator } from '../../src/services/firebaseUtils';

const isTestEnv = process.env.NODE_ENV === 'test'|| Config.USE_EMULATORS === 'true';
const envPrefix = isTestEnv ? 'TEST_' : '';

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
    if (isTestEnv) {
      const [dbHost, dbPort] = extractHostAndPort(`${envPrefix}DATABASE_URL`);
      const [storageHost, storagePort] = extractHostAndPort(`${envPrefix}STORAGE_BUCKET`);

      // Safety check to connect to emulators only if they are not already running
      if (!isConnectedToDatabaseEmulator(db)) {
        connectDatabaseEmulator(db, dbHost, parseInt(dbPort));
      }

      if (!isConnectedToStorageEmulator(storage)) {
        connectStorageEmulator(storage, storageHost, parseInt(storagePort));
      }
    }
    return (
      <FirebaseContext.Provider value={{db, storage}} >
        {children}
      </FirebaseContext.Provider>
    );
};
