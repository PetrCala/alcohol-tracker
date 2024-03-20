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
import {StringKeyOf, ValueOf} from 'type-fest';
import {RefetchDatabaseData} from '@src/types/utils/RefetchDatabaseData';

type Data = {
  userStatusData?: UserStatus;
  drinkingSessionData?: DrinkingSessionList;
  preferences?: Preferences;
  unconfirmedDays?: UnconfirmedDays;
  userData?: UserProps;
};

type UserFetchDataKey = StringKeyOf<Data>;
type UserFetchDataValue = ValueOf<Data>;

// Define a type for the hook's return value
type UseFetchUserDataReturn = {
  data: Data;
  isLoading: boolean;
  refetch: RefetchDatabaseData;
};

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
  const [keysToFetch, setKeysToFetch] = useState<UserFetchDataKey[]>(dataTypes);

  const refetch = (keys?: UserFetchDataKey[]): Promise<void> => {
    return new Promise<void>(resolve => {
      setResolveRefetch(() => resolve);
      if (keys) {
        setKeysToFetch(keys);
      } else {
        setKeysToFetch(dataTypes); // Reset to default
      }
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
      const promises = keysToFetch.map(async dataType => {
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

      setData(prevData => {
        // Merge newData with prevData, ensuring only specified keys are updated
        const updatedData = {...prevData};

        for (const key of keysToFetch) {
          if (newData.hasOwnProperty(key)) {
            updatedData[key] = newData[key];
          }
          // If newData does not have the key, prevData[key] remains unchanged
        }

        return updatedData;
      });

      setIsLoading(false);
      resolveRefetch(); // Resolve the promise only after fetching is complete
    };

    fetchData();
  }, [userId, refetchIndex]); // No dataTypes, as that would duplicate the refetch

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
