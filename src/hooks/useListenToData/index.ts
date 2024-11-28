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
 * @param userID User to listen to the data for
 * @param dataTypes Database node keys to listen to data for
 * @returns An object with the data and a loading state
 * @example
 * const {data, isLoading, refetch} = useListenToData(userID, ['userStatusData', 'drinkingSessionData']);
 */
const useListenToData = (
  dataTypes: FetchDataKeys,
  userID?: string,
): UseListenToDataReturn => {
  const {db} = useFirebase();
  const [data, setData] = useState<{[key in FetchDataKey]?: any}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribers = dataTypes.map(dataTypes => {
      const path = fetchDataKeyToDbPath(dataTypes, userID);

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
  }, [userID, ...dataTypes]); // Depend on dataTypes to allow dynamically changing what data to listen to

  return {
    data: data,
    isLoading,
  };
};

export default useListenToData;
