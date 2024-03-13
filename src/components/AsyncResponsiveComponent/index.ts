import React, {useState, useEffect, useRef, useCallback} from 'react';
import {AsyncResponsiveComponentProps} from './types';

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
