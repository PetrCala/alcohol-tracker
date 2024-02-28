import {useEffect, useState} from 'react';
import {isEqual} from 'lodash';
import {listenForDataChanges} from '@database/baseFunctions';
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
import DeepValueOf from '@src/types/utils/DeepValueOf';

// Define a type for the hook's return value
type UseFetchUserDataReturn = {
  data: {
    userStatusData?: UserStatus;
    drinkingSessionData?: DrinkingSessionList;
    preferences?: Preferences;
    unconfirmedDays?: UnconfirmedDays;
    userData?: UserProps;
  };
  isLoading: boolean;
};

type UserFetchDataKey = keyof UseFetchUserDataReturn['data'];
type UserFetchDataValue = ValueOf<UseFetchUserDataReturn['data']>;

/**
 * Custom hook to fetch and listen for updates on specified user-related data from the database.
 *
 * This hook abstracts away the database fetching logic, allowing components to request various types
 * of data based on a user ID. It listens for real-time updates to the specified data types and
 * manages the loading state.
 *
 * @param {string} userId The ID of the user for whom data is to be fetched.
 * @param {DataType[]} dataTypes An array of data types to fetch for the user.
 *
 * @returns {UseFetchDataReturn} An object containing the fetched data and a loading state.
 *
 * @example
 * const { data, isLoading } = useFetchData(userId, ['userStatus', 'preferences']);
 * if (isLoading) return <LoadingSpinner />;
 * return (
 *   <div>
 *     <p>User Status: {data.userStatusData?.status}</p>
 *     <p>Preferences: {JSON.stringify(data.preferences)}</p>
 *   </div>
 * );
 */
const useFetchData = (
  userId: string,
  dataTypes: UserFetchDataKey[],
): UseFetchUserDataReturn => {
  const {db} = useFirebase();
  const [data, setData] = useState<{[key in UserFetchDataKey]?: any}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId || !db) {
      setIsLoading(false);
      return;
    }

    const stopListeningFns: Function[] = [];
    setIsLoading(true);

    dataTypes.forEach(dataType => {
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
        const stopListening = listenForDataChanges(
          db,
          path,
          (fetchedData: any) => {
            console.log('fetchedData', fetchedData);
            setData(prevData => ({
              ...prevData,
              [dataType]: fetchedData,
            }));
          },
        );
        stopListeningFns.push(stopListening);
      }
    });

    setIsLoading(false);

    return () => {
      stopListeningFns.forEach(stopListening => stopListening());
    };
  }, [userId, dataTypes, db]);

  return {
    data: {
      userStatusData: data.userStatusData,
      drinkingSessionData: data.drinkingSessionData,
      preferences: data.preferences,
      unconfirmedDays: data.unconfirmedDays,
      userData: data.userData,
    },
    isLoading,
  };
};

export default useFetchData;
export type {UseFetchUserDataReturn, UserFetchDataKey};
