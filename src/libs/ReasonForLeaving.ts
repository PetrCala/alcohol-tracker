import type {ReasonForLeavingId} from '@src/types/onyx';
import type {UserID} from '@src/types/onyx/OnyxCommon';
import CONST from '@src/CONST';
import StringUtils from './StringUtils';

/**
 * Generate a unique reason for leaving ID as a hash combination of the user ID and the current timestamp.
 *
 * @param userID Id of the user that is leaving
 * @returns A unique reason for leaving ID
 */
function getReasonForLeavingID(userID: UserID): ReasonForLeavingId {
  return StringUtils.generateUniqueHash(
    userID,
    Date.now(),
    CONST.REASON_FOR_LEAVING.DB_KEY_LENGTH,
  );
}

export {getReasonForLeavingID};
