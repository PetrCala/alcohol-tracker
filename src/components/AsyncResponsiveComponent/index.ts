import React, {useState, useEffect, useRef, useCallback} from 'react';
import {AsyncResponsiveComponentProps} from './types';


  // const asyncOperation = async (
  //   triggerRef: React.MutableRefObject<any>,
  //   checkIsActive: () => boolean,
  // ) => {
  //   console.log('Async operation started with trigger:', triggerRef.current);

  //   // Simulating an async task (e.g., data fetching)
  //   await new Promise(resolve => setTimeout(resolve, 5));

  //   if (!checkIsActive()) {
  //     console.log(
  //       'Async operation halted or results ignored because the trigger changed or component unmounted',
  //     );
  //     return;
  //   }

  //   console.log('Async operation completed with trigger:', triggerRef.current);
  //   // Here, you could check triggerRef.current to decide how to proceed based on its latest value
  // };
const AsyncResponsiveComponent: React.FC<AsyncResponsiveComponentProps> = ({
  trigger, // pendingUpdate
  asyncOperation, // waitForPendingUpdate
}) => {
  const [isActive, setIsActive] = useState(true);
  const triggerRef = useRef(trigger);

  // Function to check if the component's async operation should still be considered active
  const checkIsActive = useCallback(() => isActive, [isActive]);

  useEffect(() => {
    triggerRef.current = trigger;
  }, [trigger]);

  useEffect(() => {
    const executeAsyncOperation = async () => {
      await asyncOperation(triggerRef, checkIsActive);
    };

    if (isActive) {
      executeAsyncOperation();
    }

    // Cleanup function to set isActive to false when the component unmounts
    // or when the trigger changes, effectively signaling the asyncOperation to halt or ignore its results
    return () => setIsActive(false);
  }, [asyncOperation, checkIsActive, trigger, isActive]);

  return null; // This component does not render anything itself
};

export default AsyncResponsiveComponent;

