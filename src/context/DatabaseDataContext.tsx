// DatabaseDataContext.tsx
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import {
  CurrentSessionData,
  DrinkingSessionArrayItem,
  DrinkingSessionData,
  PreferencesData,
  UnconfirmedDaysData,
  UserData,
} from '../types/database';
import {auth} from '../services/firebaseSetup';
import {listenForDataChanges} from '../database/baseFunctions';
import {isEqual} from 'lodash';
import {useFirebase} from './FirebaseContext';

type DatabaseDataContextType = {
  currentSessionData: CurrentSessionData | null;
  drinkingSessionData: DrinkingSessionArrayItem[];
  drinkingSessionKeys: string[];
  preferences: PreferencesData | null;
  unconfirmedDays: UnconfirmedDaysData | null;
  userData: UserData | null;
  isLoading: boolean;
};

export const DatabaseDataContext = createContext<
  DatabaseDataContextType | undefined
>(undefined);

/** Fetch the databasedata context. If the context does not exist, throw an error.
 *
 * @example { dbData } = getDatabaseData();
 * let preferences = dbData.preferences; // If it exists
 */
export const getDatabaseData = (): DatabaseDataContextType => {
  const data = useContext(DatabaseDataContext);
  if (!data) {
    throw new Error(
      'getDatabaseData must be used within a DatabaseDataProvider',
    );
  }
  return data;
};

type DatabaseDataProviderProps = {
  children: ReactNode;
};

const initialState = {
  currentSessionData: null,
  drinkingSessionData: [],
  drinkingSessionKeys: [],
  preferences: null,
  unconfirmedDays: null,
  userData: null,
  loadingCurrentSessionData: true,
  loadingDrinkingSessionData: true,
  loadingUserPreferences: true,
  loadingUnconfirmedDays: true,
  loadingUserData: true,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_CURRENT_SESSION_DATA':
      return {...state, currentSessionData: action.payload};
    case 'SET_DRINKING_SESSION_DATA':
      return {...state, drinkingSessionData: action.payload};
    case 'SET_DRINKING_SESSION_KEYS':
      return {...state, drinkingSessionKeys: action.payload};
    case 'SET_PREFERENCES':
      return {...state, preferences: action.payload};
    case 'SET_UNCONFIRMED_DAYS':
      return {...state, unconfirmedDays: action.payload};
    case 'SET_USER_DATA':
      return {...state, userData: action.payload};
    case 'SET_LOADING_CURRENT_SESSION_DATA':
      return {...state, loadingCurrentSessionData: action.payload};
    case 'SET_LOADING_DRINKING_SESSION_DATA':
      return {...state, loadingDrinkingSessionData: action.payload};
    case 'SET_LOADING_USER_PREFERENCES':
      return {...state, loadingUserPreferences: action.payload};
    case 'SET_LOADING_UNCONFIRMED_DAYS':
      return {...state, loadingUnconfirmedDays: action.payload};
    case 'SET_LOADING_USER_DATA':
      return {...state, loadingUserData: action.payload};
    default:
      return state;
  }
};

export const DatabaseDataProvider: React.FC<DatabaseDataProviderProps> = ({
  children,
}) => {
  const user = auth.currentUser;
  const {db} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Database data hooks
  const isLoading = [
    state.loadingCurrentSessionData,
    state.loadingDrinkingSessionData,
    state.loadingUserPreferences,
    state.loadingUnconfirmedDays,
    state.loadingUserData,
  ].some(Boolean); // true if any of them is true

  // Monitor current session data
  useEffect(() => {
    if (!user || !db) return;
    let userRef = `user_current_session/${user.uid}`;
    let stopListening = listenForDataChanges(
      db,
      userRef,
      (data: CurrentSessionData) => {
        dispatch({type: 'SET_CURRENT_SESSION_DATA', payload: data});
        dispatch({type: 'SET_LOADING_CURRENT_SESSION_DATA', payload: false});
      },
    );

    return () => stopListening();
  }, []);

  // Monitor drinking session data and keys
  useEffect(() => {
    if (!user || !db) return;
    // Start listening for changes when the component mounts
    let newData: DrinkingSessionArrayItem[];
    let newKeys: string[];
    let sessionsRef = `user_drinking_sessions/${user.uid}`;
    let stopListening = listenForDataChanges(
      db,
      sessionsRef,
      (data: DrinkingSessionData) => {
        newData = data ? Object.values(data) : [];
        newKeys = data ? Object.keys(data) : [];
        if (!isEqual(newData, state.drinkingSessionData)) {
          dispatch({type: 'SET_DRINKING_SESSION_DATA', payload: newData});
        }
        if (!isEqual(newKeys, state.drinkingSessionKeys)) {
          dispatch({type: 'SET_DRINKING_SESSION_KEYS', payload: newKeys});
        }
        dispatch({type: 'SET_LOADING_DRINKING_SESSION_DATA', payload: false});
      },
    );

    // Stop listening for changes when the component unmounts
    return () => {
      stopListening();
    };
  }, []);


  // Monitor user preferences
  useEffect(() => {
    if (!user || !db) return;
    let userRef = `user_preferences/${user.uid}`;
    let stopListening = listenForDataChanges(
      db,
      userRef,
      (data: PreferencesData) => {
        if (!isEqual(data, state.preferences)) {
          dispatch({type: 'SET_PREFERENCES', payload: data});
        }
        dispatch({type: 'SET_LOADING_USER_PREFERENCES', payload: false});
      },
    );

    return () => stopListening();
  }, []);

  // Monitor unconfirmed days
  useEffect(() => {
    if (!user || !db) return;
    let newData: UnconfirmedDaysData = {};
    let userRef = `user_unconfirmed_days/${user.uid}`;
    let stopListening = listenForDataChanges(
      db,
      userRef,
      (data: UnconfirmedDaysData) => {
        newData = data ? data : {};
        if (!isEqual(newData, state.unconfirmedDays)) {
          dispatch({type: 'SET_UNCONFIRMED_DAYS', payload: newData});
        }
        dispatch({type: 'SET_LOADING_UNCONFIRMED_DAYS', payload: false});
      },
    );

    return () => stopListening();
  }, []);

  // Monitor user data
  useEffect(() => {
    if (!user || !db) return;
    let userRef = `users/${user.uid}`;
    let stopListening = listenForDataChanges(db, userRef, (data: UserData) => {
      if (!isEqual(data, state.userData)) {
        dispatch({type: 'SET_USER_DATA', payload: data});
      }
      dispatch({type: 'SET_LOADING_USER_DATA', payload: false});
    });

    return () => stopListening();
  }, []);

  // Provide empty context if the login expires
  if (!user || !db)
    return (
      <DatabaseDataContext.Provider value={undefined}>
        {children}
      </DatabaseDataContext.Provider>
    );

  // if (isLoading) return <LoadingData loadingText=''/>;

  const value = {
    currentSessionData: state.currentSessionData,
    drinkingSessionData: state.drinkingSessionData,
    drinkingSessionKeys: state.drinkingSessionKeys,
    preferences: state.preferences,
    unconfirmedDays: state.unconfirmedDays,
    userData: state.userData,
    isLoading: isLoading,
  };

  return (
    <DatabaseDataContext.Provider value={value}>
      {children}
    </DatabaseDataContext.Provider>
  );
};
