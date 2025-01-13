// DatabaseDataContext.tsx
import type {ReactNode} from 'react';
import React, {createContext, useContext, useMemo} from 'react';
import type {
  DrinkingSessionList,
  Preferences,
  UnconfirmedDays,
  UserData,
  UserStatus,
} from '@src/types/onyx';
import type {FetchDataKeys} from '@hooks/useFetchData/types';
import useListenToData from '@hooks/useListenToData';
import {useFirebase} from './FirebaseContext';

type DatabaseDataContextType = {
  userStatusData?: UserStatus;
  drinkingSessionData?: DrinkingSessionList;
  preferences?: Preferences;
  unconfirmedDays?: UnconfirmedDays;
  userData?: UserData;
};

const DatabaseDataContext = createContext<DatabaseDataContextType | undefined>(
  undefined,
);

const useDatabaseData = (): DatabaseDataContextType => {
  const context = useContext(DatabaseDataContext);
  if (!context) {
    throw new Error(
      'useDatabaseData must be used within a DatabaseDataProvider',
    );
  }
  return context;
};

type DatabaseDataProviderProps = {
  children: ReactNode;
};

function DatabaseDataProvider({children}: DatabaseDataProviderProps) {
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const userID = user ? user.uid : '';

  const dataTypes: FetchDataKeys = [
    'userStatusData',
    'drinkingSessionData',
    'preferences',
    'unconfirmedDays',
    'userData',
  ];

  const {data} = useListenToData(dataTypes, userID);

  const value = useMemo(
    () => ({
      userStatusData: data.userStatusData,
      drinkingSessionData: data.drinkingSessionData,
      preferences: data.preferences,
      unconfirmedDays: data.unconfirmedDays,
      userData: data.userData,
    }),
    [data],
  );

  // Monitor local data for changes - TODO rewrite this later
  // useEffect(() => {
  //   Object.entries(data).forEach(([key, value]) => {
  //     if (key === 'userData') {
  //       Onyx.merge(ONYXKEYS.USER_DATA_LIST, {
  //         [userID]: value as UserData,
  //       });
  //     }
  //   });
  // }, [data.userData]);

  return (
    <DatabaseDataContext.Provider value={value}>
      {children}
    </DatabaseDataContext.Provider>
  );
}

export {DatabaseDataContext, useDatabaseData, DatabaseDataProvider};
