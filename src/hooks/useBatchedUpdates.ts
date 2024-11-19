import {useState, useRef, useCallback, useEffect} from 'react';

const useBatchedUpdates = (
  processUpdates: (updates: any) => Promise<void>,
  delay: number = 500,
) => {
  const [isPending, setIsPending] = useState(false);
  const updatesRef = useRef<any>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const enqueueUpdate = useCallback(
    (update: any) => {
      // Merge the new update into the accumulated updates
      updatesRef.current = {
        ...updatesRef.current,
        ...update,
      };

      // If there's no timer running, start one
      if (!timerRef.current) {
        timerRef.current = setTimeout(async () => {
          setIsPending(true);

          // Process the accumulated updates
          const updatesToProcess = {...updatesRef.current};
          updatesRef.current = {}; // Clear the accumulated updates

          await processUpdates(updatesToProcess);

          setIsPending(false);
          timerRef.current = null;
        }, delay);
      }
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
