import {useFirebase} from '@context/global/FirebaseContext';
import {listenForDataChanges} from '@database/baseFunctions';
import type {
  FetchData,
  FetchDataKey,
  FetchDataKeys,
} from '@hooks/useFetchData/types';
import {fetchDataKeyToDbPath} from '@hooks/useFetchData/utils';
import useLocalize from '@hooks/useLocalize';
import * as App from '@userActions/App';
import {useEffect, useState} from 'react';

/* eslint-disable react-compiler/react-compiler */

// Define a type for the hook's return value
type UseListenToDataReturn = {
  data: FetchData;
};

/**
 * Custom hook to listen to data in the database.
 *
 * Allows to listen to user's data only in the relevant database nodes. Does not attach
 * listeners for the unused keys.
 *
 * @param userID User to listen to the data for
 * @param dataTypes Database node keys to listen to data for
 * @returns An object with the data
 * @example
 * const {data} = useListenToData(userID, ['userStatusData', 'drinkingSessionData']);
 */
const useListenToData = (
  dataTypes: FetchDataKeys,
  userID?: string,
): UseListenToDataReturn => {
  const {db} = useFirebase();
  const {translate} = useLocalize();
  const [data, setData] = useState<Partial<Record<FetchDataKey, unknown>>>({});

  useEffect(() => {
    if (!db) {
      App.setLoadingText(null);
      return;
    }

    App.setLoadingText(translate('database.loading'));

    const unsubscribers = dataTypes.map(dataTypeKey => {
      const path = fetchDataKeyToDbPath(dataTypeKey, userID);

      if (path) {
        return listenForDataChanges(db, path, fetchedData => {
          setData(prevData => ({
            ...prevData,
            [dataTypeKey]: fetchedData,
          }));
        });
      }
      return () => {};
    });

    App.setLoadingText(null);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, userID, translate]);

  return {
    data: data as FetchData,
  };
};

export default useListenToData;
