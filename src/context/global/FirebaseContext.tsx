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
import {isConnectedToAuthEmulator} from '@src/services/firebaseUtils';
import {FirebaseApp} from 'firebase/app';
import firebaseConfig from '@src/services/firebaseConfig';
import {
  extractHostAndPort,
  isConnectedToDatabaseEmulator,
  isConnectedToStorageEmulator,
} from '../../services/firebaseUtils';
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
  app: FirebaseApp;
  children: ReactNode;
};

/** Provide a firebase context to the application
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  app,
  children,
}) => {
  // Initialize Auth with React Native persistence
  const auth: Auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  const db = getDatabase(app);
  const storage = getStorage(app);

  // Check if emulators should be used
  if (isTestEnv) {
    if (!firebaseConfig.authDomain)
      throw new Error('Auth URL not defined in firebaseConfig');
    if (!firebaseConfig.databaseURL)
      throw new Error('Database URL not defined in firebaseConfig');
    if (!firebaseConfig.storageBucket)
      throw new Error('Storage bucket not defined in firebaseConfig');

    const [dbHost, dbPort] = extractHostAndPort(firebaseConfig.databaseURL);
    const [storageHost, storagePort] = extractHostAndPort(
      firebaseConfig.storageBucket,
    );

    if (!isConnectedToAuthEmulator(auth)) {
      connectAuthEmulator(auth, firebaseConfig.authDomain);
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
