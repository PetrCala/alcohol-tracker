import { ReactNode, createContext, useContext } from 'react';
import { Database, getDatabase } from 'firebase/database';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

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
  
    return (
      <FirebaseContext.Provider value={{db, storage}} >
        {children}
      </FirebaseContext.Provider>
    );
};