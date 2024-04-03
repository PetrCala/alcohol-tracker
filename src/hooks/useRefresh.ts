import React, {useState} from 'react';
import type {RefetchDatabaseData} from '@src/types/utils/RefetchDatabaseData';
import type {FetchDataKeys} from './useFetchData/types';

type UseRefreshProps = {
  refetch: RefetchDatabaseData;
};

/**
 * Custom hook for handling refresh functionality.
 *
 * @param refetch - A function to trigger the data refetch.
 * @returns An object containing the `onRefresh` function, `refreshing` state, and `refreshCounter`.
 * @example
 * const { onRefresh, refreshing, refreshCounter } = useRefresh({ refetch });
 * <RefreshControl
 *   refreshing={refreshing}
 *   onRefresh={() =>
 *     onRefresh([
 *       'userStatusData',
 *       'preferences',
 *       'drinkingSessionData',
 *     ])
 *   }
 * />
 */
const useRefresh = ({refetch}: UseRefreshProps) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  const onRefresh = React.useCallback(
    (keys?: FetchDataKeys) => {
      setRefreshing(true);

      setTimeout(() => {
        refetch(keys).then(() => {
          setRefreshing(false);
          setRefreshCounter(prevCounter => prevCounter + 1);
        });
      }, 1000);
    },
    [refetch],
  );

  return {onRefresh, refreshing, refreshCounter};
};

export default useRefresh;
