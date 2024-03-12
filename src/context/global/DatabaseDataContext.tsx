// DatabaseDataContext.tsx
import React, {createContext, useContext, ReactNode, useMemo} from 'react';
import {useFirebase} from './FirebaseContext';
import {
  DrinkingSessionList,
  Preferences,
  UnconfirmedDays,
  UserProps,
  UserStatus,
} from '@src/types/database';
import useFetchData, {UserFetchDataKey} from '@hooks/useFetchData'; // Ensure this import is corrected if needed

type DatabaseDataContextType = {
  userStatusData?: UserStatus;
  drinkingSessionData?: DrinkingSessionList;
  preferences?: Preferences;
  unconfirmedDays?: UnconfirmedDays;
  userData?: UserProps;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const DatabaseDataContext = createContext<
  DatabaseDataContextType | undefined
>(undefined);

export const useDatabaseData = (): DatabaseDataContextType => {
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

export const DatabaseDataProvider: React.FC<DatabaseDataProviderProps> = ({
  children,
}) => {
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const userId = user ? user.uid : '';

  const dataTypes: UserFetchDataKey[] = [
    'userStatusData',
    'drinkingSessionData',
    'preferences',
    'unconfirmedDays',
    'userData',
  ];

  const {data, isLoading, refetch} = useFetchData(userId, dataTypes);

  const value = useMemo(
    () => ({
      userStatusData: data.userStatusData,
      drinkingSessionData: data.drinkingSessionData,
      preferences: data.preferences,
      unconfirmedDays: data.unconfirmedDays,
      userData: data.userData,
      isLoading,
      refetch,
    }),
    [data, isLoading, refetch],
  );

  return (
    <DatabaseDataContext.Provider value={value}>
      {children}
    </DatabaseDataContext.Provider>
  );
};
