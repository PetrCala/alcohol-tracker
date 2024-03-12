import {useEffect, useState} from 'react';
import {readDataOnce} from '@database/baseFunctions'; // Ensure this import is added
import DBPATHS from '@database/DBPATHS';
import {useFirebase} from '@context/global/FirebaseContext';
import {
  DrinkingSessionList,
  Preferences,
  UnconfirmedDays,
  UserProps,
  UserStatus,
} from '@src/types/database';
import {ValueOf} from 'type-fest';

type Data = {
  userStatusData?: UserStatus;
  drinkingSessionData?: DrinkingSessionList;
  preferences?: Preferences;
  unconfirmedDays?: UnconfirmedDays;
  userData?: UserProps;
};

// Define a type for the hook's return value
type UseFetchUserDataReturn = {
  data: Data;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

type UserFetchDataKey = keyof UseFetchUserDataReturn['data'];
type UserFetchDataValue = ValueOf<UseFetchUserDataReturn['data']>;

const useFetchData = (
  userId: string,
  dataTypes: UserFetchDataKey[],
): UseFetchUserDataReturn => {
  const {db} = useFirebase();
  const [refetchIndex, setRefetchIndex] = useState(0); // Used to trigger refetch
  const [data, setData] = useState<{[key in UserFetchDataKey]?: any}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolveRefetch, setResolveRefetch] = useState<() => void>(
    () => () => {},
  );

  const refetch = (): Promise<void> => {
    return new Promise<void>(resolve => {
      setResolveRefetch(() => resolve);
      setRefetchIndex(prev => prev + 1);
    });
  };

  useEffect(() => {
    if (!userId || !db) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const promises = dataTypes.map(async dataType => {
        let path;
        switch (dataType) {
          case 'userStatusData':
            path = DBPATHS.USER_STATUS_USER_ID.getRoute(userId);
            break;
          case 'drinkingSessionData':
            path = DBPATHS.USER_DRINKING_SESSIONS_USER_ID.getRoute(userId);
            break;
          case 'preferences':
            path = DBPATHS.USER_PREFERENCES_USER_ID.getRoute(userId);
            break;
          case 'unconfirmedDays':
            path = DBPATHS.USER_UNCONFIRMED_DAYS_USER_ID.getRoute(userId);
            break;
          case 'userData':
            path = DBPATHS.USERS_USER_ID.getRoute(userId);
            break;
        }

        if (path) {
          const fetchedData = await readDataOnce(db, path);
          return {[dataType]: fetchedData};
        }
        return {};
      });

      const results = await Promise.all(promises);
      const newData = results.reduce(
        (acc, currentData) => ({
          ...acc,
          ...currentData,
        }),
        {},
      );

      setData(newData);
      setIsLoading(false);
      resolveRefetch(); // Resolve the promise only after fetching is complete
    };

    fetchData();
  }, [userId, db, refetchIndex]);

  return {
    data: {
      userStatusData: data.userStatusData,
      drinkingSessionData: data.drinkingSessionData,
      preferences: data.preferences,
      unconfirmedDays: data.unconfirmedDays,
      userData: data.userData,
    },
    isLoading,
    refetch,
  };
};

export default useFetchData;
export type {UseFetchUserDataReturn, UserFetchDataKey};
