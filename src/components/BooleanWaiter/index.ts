import React, {useEffect} from 'react';
import {BooleanWaiterProps} from './types';

/**
 * A component that waits for a boolean value to become true, with a timeout.
 * When the boolean becomes true, the onResolved callback is called.
 */
const BooleanWaiter: React.FC<BooleanWaiterProps> = ({
  value,
  timeout = 30000,
  onTimeout,
  onResolved,
}) => {
  useEffect(() => {
    if (value) {
      onResolved();
      return;
    }

    const checkInterval = setInterval(() => {
      if (value) {
        clearInterval(checkInterval);
        onResolved();
      }
    }, 100); // Check every 100ms

    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      onTimeout();
    }, timeout);

    // Cleanup function to clear interval and timeout
    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
    };
  }, [value, timeout, onTimeout, onResolved]);

  return null; // This component does not render anything
};

export default BooleanWaiter;
