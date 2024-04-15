import {useState, useRef, useCallback} from 'react';

type UpdateFunction = (newForm: any) => Promise<void>

const useAsyncQueue = (onUpdate: UpdateFunction) => {
  const [isPending, setIsPending] = useState(false);
  const pendingFormRef = useRef<any>(null);
  const isUpdateInProgress = useRef(false);

  const startUpdate = useCallback(
    async (form: any) => {
      isUpdateInProgress.current = true;
      setIsPending(true);
      await onUpdate(form);
      isUpdateInProgress.current = false;
      setIsPending(false);

      if (pendingFormRef.current !== null) {
        const nextForm = pendingFormRef.current;
        pendingFormRef.current = null; // Clear the pending form slot
        startUpdate(nextForm); // Process the next form
      }
    },
    [onUpdate],
  );

  const enqueueUpdate = useCallback(
    (newForm: any) => {
      if (isUpdateInProgress.current) {
        // Replace the current pending form
        pendingFormRef.current = newForm;
      } else {
        // No update in progress, start a new one
        startUpdate(newForm);
      }
    },
    [startUpdate],
  );

  return {isPending, enqueueUpdate};
};

export default useAsyncQueue;
