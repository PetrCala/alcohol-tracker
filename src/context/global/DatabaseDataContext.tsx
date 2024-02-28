// DatabaseDataContext.tsx
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import {listenForDataChanges} from '@database/baseFunctions';
import {isEqual} from 'lodash';
import {useFirebase} from './FirebaseContext';
import {
  DrinkingSessionArray,
  DrinkingSessionList,
  Preferences,
  UnconfirmedDays,
  UserProps,
  UserStatus,
} from '@src/types/database';
import DBPATHS from '@database/DBPATHS';
import useFetchData, {UserFetchDataKey} from '@hooks/useFetchData';

type DatabaseDataContextType = {
  userStatusData: UserStatus | undefined;
  drinkingSessionData: DrinkingSessionList | undefined;
  preferences: Preferences | undefined;
  unconfirmedDays: UnconfirmedDays | undefined;
  userData: UserProps | undefined;
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
  userStatusData: null,
  drinkingSessionData: null,
  preferences: null,
  unconfirmedDays: null,
  userData: null,
  loadingUserStatusData: true,
  loadingDrinkingSessionData: true,
  loadingUserPreferences: true,
  loadingUnconfirmedDays: true,
  loadingUserData: true,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_USER_STATUS_DATA':
      return {...state, userStatusData: action.payload};
    case 'SET_DRINKING_SESSION_DATA':
      return {...state, drinkingSessionData: action.payload};
    case 'SET_PREFERENCES':
      return {...state, preferences: action.payload};
    case 'SET_UNCONFIRMED_DAYS':
      return {...state, unconfirmedDays: action.payload};
    case 'SET_USER_DATA':
      return {...state, userData: action.payload};
    case 'SET_LOADING_USER_STATUS_DATA':
      return {...state, loadingUserStatusData: action.payload};
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

// export const DatabaseDataProvider: React.FC<DatabaseDataProviderProps> = ({
//   children,
// }) => {
//   const {auth} = useFirebase();
//   const user = auth.currentUser;
//   const userId = user ? user.uid : '';

// Use useMemo to ensure dataTypes array reference stability
// const dataTypes = useMemo(
//   () => [
//     'userStatus',
//     'drinkingSessionData',
//     'preferences',
//     'unconfirmedDays',
//     'userData',
//   ],
//   [],
// );

//   // Use the custom hook to fetch data
//   const {data, isLoading} = useFetchData(userId, dataTypes);

// Prepare the value to be provided through the context
// const value = useMemo(() => ({
//   userStatusData: data.userStatusData,
//   drinkingSessionData: data.drinkingSessionData,
//   preferences: data.preferences,
//   unconfirmedDays: data.unconfirmedDays,
//   userData: data.userData,
//   isLoading,
// }), [data, isLoading]); // Only recalculate the value if data or isLoading changes

//   return (
//     <DatabaseDataContext.Provider value={value}>
//       {children}
//     </DatabaseDataContext.Provider>
//   );
// };

export const DatabaseDataProvider: React.FC<DatabaseDataProviderProps> = ({
  children,
}) => {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const [state, dispatch] = useReducer(reducer, initialState);

  // Database data hooks
  const isLoading = [
    state.loadingUserStatus,
    state.loadingDrinkingSessionData,
    state.loadingUserPreferences,
    state.loadingUnconfirmedDays,
    state.loadingUserData,
  ].some(Boolean); // true if any of them is true

  // Monitor user status data
  useEffect(() => {
    if (!user || !db) return;
    let userPath = DBPATHS.USER_STATUS_USER_ID.getRoute(user.uid);
    let stopListening = listenForDataChanges(
      db,
      userPath,
      (data: UserStatus) => {
        dispatch({type: 'SET_USER_STATUS_DATA', payload: data});
        dispatch({type: 'SET_LOADING_USER_STATUS_DATA', payload: false});
      },
    );

    return () => stopListening();
  }, []);

  // Monitor drinking session data and keys
  useEffect(() => {
    if (!user || !db) return;
    // Start listening for changes when the component mounts
    let sessionsPath = DBPATHS.USER_DRINKING_SESSIONS_USER_ID.getRoute(
      user.uid,
    );
    let stopListening = listenForDataChanges(
      db,
      sessionsPath,
      (data: DrinkingSessionList) => {
        if (!isEqual(data, state.drinkingSessionData)) {
          dispatch({type: 'SET_DRINKING_SESSION_DATA', payload: data});
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
    let preferencesPath = DBPATHS.USER_PREFERENCES_USER_ID.getRoute(user.uid);
    let stopListening = listenForDataChanges(
      db,
      preferencesPath,
      (data: Preferences) => {
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
    let newData: UnconfirmedDays = {};
    let unconfirmedDaysRef = DBPATHS.USER_UNCONFIRMED_DAYS_USER_ID.getRoute(
      user.uid,
    );
    let stopListening = listenForDataChanges(
      db,
      unconfirmedDaysRef,
      (data: UnconfirmedDays) => {
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
    let userPath = DBPATHS.USERS_USER_ID.getRoute(user.uid);
    let stopListening = listenForDataChanges(
      db,
      userPath,
      (data: UserProps) => {
        if (!isEqual(data, state.userData)) {
          dispatch({type: 'SET_USER_DATA', payload: data});
        }
        dispatch({type: 'SET_LOADING_USER_DATA', payload: false});
      },
    );

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
    userStatusData: state.userStatusData,
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
