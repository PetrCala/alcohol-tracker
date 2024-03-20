import {useEffect, useRef} from 'react';
import {useUserConnection} from '@context/global/UserConnectionContext';

type UseNetworkProps = {
  onReconnect?: () => void;
};

type UseNetwork = {isOnline?: boolean};

export default function useNetwork({
  onReconnect = () => {},
}: UseNetworkProps = {}): UseNetwork {
  const callback = useRef(onReconnect);
  callback.current = onReconnect;

  const {isOnline} = useUserConnection();
  const previousOnlineStatusRef = useRef(isOnline);
  useEffect(() => {
    // If we were offline before and now we are not offline then we just reconnected
    const didReconnect = previousOnlineStatusRef.current && isOnline;
    if (!didReconnect) {
      return;
    }

    callback.current();
  }, [isOnline]);

  useEffect(() => {
    // Used to store previous prop values to compare on next render
    previousOnlineStatusRef.current = isOnline;
  }, [isOnline]);

  return {isOnline};
}
