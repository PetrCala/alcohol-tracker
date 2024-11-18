import {useMemo} from 'react';
import {useUserData} from '@components/OnyxProvider';
import CONST from '@src/CONST';
import type {UserData} from '@src/types/onyx';
import {auth} from '@libs/Firebase/FirebaseApp';

type CurrentUserData = UserData | Record<string, never>;

function useCurrentUserData() {
  const user = auth?.currentUser;
  const userData = useUserData() ?? CONST.EMPTY_OBJECT;
  const userID = user?.uid ?? 0;
  const accountUserData = userData?.[userID];
  const currentUserData: CurrentUserData = useMemo(
    () =>
      (accountUserData ? {...accountUserData, userID} : {}) as CurrentUserData,
    [accountUserData, userID],
  );

  return currentUserData;
}

export default useCurrentUserData;
