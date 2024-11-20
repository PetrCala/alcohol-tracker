import {useState, useRef, useCallback, useEffect} from 'react';
import {Alert} from 'react-native';
import useLocalize from './useLocalize';

const useBatchedUpdates = (
  processUpdates: (updates: any) => Promise<void>,
  delay: number = 500,
) => {
  const {translate} = useLocalize();
  const [isPending, setIsPending] = useState(false);
  const updatesRef = useRef<any>({});
  const syncingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retriesRef = useRef<number>(0);
  const maxRetries = 3;

  const enqueueUpdate = useCallback(
    (update: any) => {
      // Merge the new update into the accumulated updates
      updatesRef.current = {
        ...updatesRef.current,
        ...update,
      };

      // Reset the timer every time an update is enqueued
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Schedule synchronization after 'delay' milliseconds of inactivity
      timerRef.current = setTimeout(() => {
        if (syncingRef.current) {
          // If synchronization is already in progress, reschedule
          timerRef.current = setTimeout(() => {
            enqueueUpdate({});
          }, delay);
          return;
        }

        if (Object.keys(updatesRef.current).length === 0) {
          // No updates to process
          return;
        }

        // Start synchronization
        syncingRef.current = true;
        setIsPending(true);

        (async () => {
          const updatesToProcess = {...updatesRef.current};
          try {
            await processUpdates(updatesToProcess);

            // Remove processed updates from the pool only if they haven't changed during synchronization, meaning if a new update to that key was enqueued
            Object.keys(updatesToProcess).forEach(key => {
              if (updatesRef.current[key] === updatesToProcess[key]) {
                delete updatesRef.current[key];
              }
            });
            retriesRef.current = 0;
          } catch (error: any) {
            // On failure, keep updates in the pool and raise an alert
            Alert.alert(translate('database.error.saveData'), error.message);
            retriesRef.current += 1;
          } finally {
            syncingRef.current = false;
            setIsPending(false);
            // If new updates arrived during synchronization, schedule another sync
            if (
              Object.keys(updatesRef.current).length > 0 &&
              retriesRef.current < maxRetries
            ) {
              enqueueUpdate({});
            }
          }
        })();
      }, delay);
    },
    [processUpdates, delay],
  );

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {isPending, enqueueUpdate};
};

export default useBatchedUpdates;
