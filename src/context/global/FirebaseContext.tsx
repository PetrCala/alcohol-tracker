import {ReactNode, createContext, useContext} from 'react';
import {
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
  Auth,
} from 'firebase/auth';
import {
  Database,
  connectDatabaseEmulator,
  getDatabase,
} from 'firebase/database';
import {
  FirebaseStorage,
  getStorage,
  connectStorageEmulator,
} from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {isConnectedToAuthEmulator} from '@src/libs/Firebase/FirebaseUtils';
import {FirebaseApp} from '@libs/Firebase/FirebaseApp';
import FirebaseConfig from '@libs/Firebase/FirebaseConfig';
import {
  extractHostAndPort,
  isConnectedToDatabaseEmulator,
  isConnectedToStorageEmulator,
} from '@src/libs/Firebase/FirebaseUtils';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

const isTestEnv =
  process.env.NODE_ENV === 'test' ||
  CONFIG.APP_ENVIRONMENT === CONST.ENVIRONMENT.TEST;

type FirebaseContextProps = {
  auth: Auth;
  db: Database;
  storage: FirebaseStorage;
};

const FirebaseContext = createContext<FirebaseContextProps | null>(null);

/** Fetch the FirebaseContext. If the context does not exist, throw an error.
 *
 * @example { db, storage } = useFirebase();
 */
export const useFirebase = (): FirebaseContextProps => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error(
      'firebaseContext must be used within a FirebaseContextProvider',
    );
  }
  return context;
};

type FirebaseProviderProps = {
  children: ReactNode;
};

/** Provide a firebase context to the application
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  // Initialize Auth with React Native persistence
  const auth: Auth = initializeAuth(FirebaseApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  const db = getDatabase(FirebaseApp);
  const storage = getStorage(FirebaseApp);

  // Check if emulators should be used
  if (isTestEnv) {
    if (!FirebaseConfig.authDomain)
      throw new Error('Auth URL not defined in FirebaseConfig');
    if (!FirebaseConfig.databaseURL)
      throw new Error('Database URL not defined in FirebaseConfig');
    if (!FirebaseConfig.storageBucket)
      throw new Error('Storage bucket not defined in FirebaseConfig');

    const [dbHost, dbPort] = extractHostAndPort(FirebaseConfig.databaseURL);
    const [storageHost, storagePort] = extractHostAndPort(
      FirebaseConfig.storageBucket,
    );

    if (!isConnectedToAuthEmulator(auth)) {
      connectAuthEmulator(auth, FirebaseConfig.authDomain);
    }

    // Safety check to connect to emulators only if they are not already running
    if (!isConnectedToDatabaseEmulator(db)) {
      connectDatabaseEmulator(db, dbHost, parseInt(dbPort));
    }

    if (!isConnectedToStorageEmulator(storage)) {
      connectStorageEmulator(storage, storageHost, parseInt(storagePort));
    }
  }

  return (
    <FirebaseContext.Provider value={{auth, db, storage}}>
      {children}
    </FirebaseContext.Provider>
  );
};
