import {useFirebase} from '@context/global/FirebaseContext';
import {listenForDataChanges} from '@database/baseFunctions';
import type {
  FetchData,
  FetchDataKey,
  FetchDataKeys,
} from '@hooks/useFetchData/types';
import {fetchDataKeyToDbPath} from '@hooks/useFetchData/utils';
import {useEffect, useState} from 'react';

// Define a type for the hook's return value
type UseListenToDataReturn = {
  data: FetchData;
  isLoading: boolean;
};

/**
 * Custom hook to listen to data in the database.
 *
 * Allows to listen to user's data only in the relevant database nodes. Does not attach
 * listeners for the unused keys.
 *
 * @param userId User to listen to the data for
 * @param dataTypes Database node keys to listen to data for
 * @returns An object with the data and a loading state
 * @example
 * const {data, isLoading, refetch} = useListenToData(userId, ['userStatusData', 'drinkingSessionData']);
 */
const useListenToData = (
  userId: string,
  dataTypes: FetchDataKeys,
): UseListenToDataReturn => {
  const {db} = useFirebase();
  const [data, setData] = useState<{[key in FetchDataKey]?: any}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId || !db) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribers = dataTypes.map(dataTypes => {
      const path = fetchDataKeyToDbPath(dataTypes, userId);

      if (path) {
        return listenForDataChanges(db, path, fetchedData => {
          setData(prevData => ({...prevData, [dataTypes]: fetchedData}));
        });
      }
      return () => {};
    });

    setIsLoading(false);

    // Cleanup function to unsubscribe from all listeners when the component unmounts or the effect reruns
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [userId, ...dataTypes]); // Depend on dataTypes to allow dynamically changing what data to listen to

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

export default useListenToData;
