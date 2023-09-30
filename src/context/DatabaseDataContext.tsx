// DatabaseDataContext.tsx
import { ReactNode, createContext, useContext } from 'react';
import { CurrentSessionData, DrinkingSessionArrayItem, PreferencesData, UnconfirmedDaysData, UserData } from '../types/database';
import DatabaseContext from './DatabaseContext';
import { getAuth } from 'firebase/auth';

type DatabaseDataContextType = {
  currentSessionData: CurrentSessionData | null;
  drinkingSessionData: DrinkingSessionArrayItem[];
  drinkingSessionKeys: string[];
  preferences: PreferencesData | null;
  unconfirmedDays: UnconfirmedDaysData | null;
  userData: UserData | null;
  isLoading: boolean;
};

export const DatabaseDataContext = createContext<DatabaseDataContextType | undefined>(undefined);

/** Fetch the databasedata context. If the context does not exist, throw an error.
 * 
 * @example { dbData } = getDatabaseData();
 * let preferences = dbData.preferences; // If it exists
 */
export const getDatabaseData = (): DatabaseDataContextType => {
    const data = useContext(DatabaseDataContext);
    if (!data) {
        throw new Error("getDatabaseData must be used within a DatabaseDataProvider");
    };
    return data;
};

type DatabaseDataProviderProps = {
  children: ReactNode;
}

export const DatabaseDataProvider: React.FC<DatabaseDataProviderProps> = ({ 
    children, 
}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = useContext(DatabaseContext);
    // Fetch the data here

    const value = {
        currentSessionData: null,
        drinkingSessionData: [],
        drinkingSessionKeys: [],
        preferences: null,
        unconfirmedDays: {["2023-08-23"]:true},
        userData: null,
        isLoading: true,
    };
  
    return (
      <DatabaseDataContext.Provider value={value}>
        {children}
      </DatabaseDataContext.Provider>
    );
};
