import {useMemo} from 'react';
import {usePersonalDetails, useSession} from '@components/OnyxProvider';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

type CurrentUserPersonalDetails = PersonalDetails | Record<string, never>;

function useCurrentUserPersonalDetails() {
  const session = useSession();
  const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
  const userID = session?.userID ?? 0;
  const accountPersonalDetails = personalDetails?.[userID];
  const currentUserPersonalDetails: CurrentUserPersonalDetails = useMemo(
    () =>
      (accountPersonalDetails
        ? {...accountPersonalDetails, userID}
        : {}) as CurrentUserPersonalDetails,
    [accountPersonalDetails, userID],
  );

  return currentUserPersonalDetails;
}

export default useCurrentUserPersonalDetails;
