// DatabaseDataContext.tsx
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { CurrentSessionData, DrinkingSessionArrayItem, DrinkingSessionData, PreferencesData, UnconfirmedDaysData, UserData } from '../types/database';
import DatabaseContext from './DatabaseContext';
import { getAuth } from 'firebase/auth';
import { listenForDataChanges } from '../database/baseFunctions';
import LoadingData from '../components/LoadingData';

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
    children 
}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = useContext(DatabaseContext);
    // Database data hooks
    const [currentSessionData, setCurrentSessionData] = useState<CurrentSessionData | null>(null);
    const [drinkingSessionData, setDrinkingSessionData] = useState<DrinkingSessionArrayItem[]>([]);
    const [drinkingSessionKeys, setDrinkingSessionKeys] = useState<string[]>([]);
    const [preferences, setPreferences] = useState<PreferencesData | null>(null);
    const [unconfirmedDays, setUnconfirmedDays] = useState<UnconfirmedDaysData | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    // Loading hooks
    const [loadingCurrentSessionData, setLoadingCurrentSessionData] = useState<boolean>(true);
    const [loadingDrinkingSessionData, setLoadingDrinkingSessionData] = useState<boolean>(true);
    const [loadingUserPreferences, setLoadingUserPreferences] = useState<boolean>(true);
    const [loadingUnconfirmedDays, setLoadingUnconfirmedDays] = useState<boolean>(true);
    const [loadingUserData, setLoadingUserData] = useState<boolean>(true);
    const isLoading = [
        loadingCurrentSessionData,
        loadingDrinkingSessionData,
        loadingUserPreferences,
        loadingUnconfirmedDays,
        loadingUserData,
    ].some(Boolean);  // true if any of them is true

    // Provide empty context if the login expires
    if (!user || !db) return (
        <DatabaseDataContext.Provider value={undefined}>
            {children}
        </DatabaseDataContext.Provider>
    );

    // Monitor current session data
    useEffect(() => {
        let userRef = `user_current_session/${user.uid}`
        let stopListening = listenForDataChanges(db, userRef, (data:CurrentSessionData) => {
            setCurrentSessionData(data);
            setLoadingCurrentSessionData(false);
        });

        return () => stopListening();

    }, [db, user]);

    // Monitor drinking session data and keys
    useEffect(() => {
        // Start listening for changes when the component mounts
        let newData:DrinkingSessionArrayItem[];
        let newKeys:string[];
        let sessionsRef = `user_drinking_sessions/${user.uid}`
        let stopListening = listenForDataChanges(db, sessionsRef, (data:DrinkingSessionData) => {
            newData = data ? Object.values(data) : [];
            newKeys = data ? Object.keys(data) : [];
            if (JSON.stringify(newData) !== JSON.stringify(drinkingSessionData)) {
                setDrinkingSessionData(newData);
            }
            if (JSON.stringify(newKeys) !== JSON.stringify(drinkingSessionKeys)) {
                setDrinkingSessionKeys(newKeys);
            }
            setLoadingDrinkingSessionData(false);
        });

        // Stop listening for changes when the component unmounts
        return () => {
        stopListening();
        };

    }, [db, user]); // Re-run effect when userId or db changes

    // Monitor user preferences
    useEffect(() => {
        let userRef = `user_preferences/${user.uid}`
        let stopListening = listenForDataChanges(db, userRef, (data:PreferencesData) => {
            if (JSON.stringify(data) !== JSON.stringify(preferences)) {
                setPreferences(data);
            };
            setLoadingUserPreferences(false);
        });

        return () => stopListening();

    }, [db, user]);

    // Monitor unconfirmed days
    useEffect(() => {
        let newData:UnconfirmedDaysData = {};
        let userRef = `user_unconfirmed_days/${user.uid}`
        let stopListening = listenForDataChanges(db, userRef, (data:UnconfirmedDaysData) => {
            newData = data ? data : {};
            if (JSON.stringify(newData) !== JSON.stringify(unconfirmedDays)) {
                setUnconfirmedDays(newData);
            };
        setLoadingUnconfirmedDays(false);
        });

        return () => stopListening();

    }, [db, user]);


    // Monitor user data
    useEffect(() => {
        let userRef = `users/${user.uid}`
        let stopListening = listenForDataChanges(db, userRef, (data:UserData) => {
            if (JSON.stringify(data) !== JSON.stringify(userData)) {
                setUserData(data);
            };
            setLoadingUserData(false);
        });

        return () => stopListening();

    }, [db, user]);

    // if (isLoading) return <LoadingData loadingText=''/>;

    const value = {
        currentSessionData: currentSessionData,
        drinkingSessionData: drinkingSessionData,
        drinkingSessionKeys: drinkingSessionKeys,
        preferences: preferences,
        unconfirmedDays: unconfirmedDays,
        userData: userData,
        isLoading: isLoading,
    };

  
    return (
      <DatabaseDataContext.Provider value={value}>
        {children}
      </DatabaseDataContext.Provider>
    );
};
