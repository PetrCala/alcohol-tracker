import type {UserID} from './OnyxCommon';

/** A unique identifier for a reason for leaving the application */
type ReasonForLeavingId = UserID;

/** A reason for leaving the application, given when deleting an account */
type ReasonForLeaving = string;

/** A collection of reasons for leaving the application */
type ReasonForLeavingList = Record<ReasonForLeavingId, ReasonForLeaving>;

export default ReasonForLeaving;
export type {ReasonForLeavingList, ReasonForLeavingId};
