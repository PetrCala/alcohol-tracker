import {UserID} from './OnyxCommon';

type ReasonForLeavingId = UserID;

type ReasonForLeaving = string;

type ReasonForLeavingList = Record<ReasonForLeavingId, ReasonForLeaving>;

export default ReasonForLeaving;
export type {ReasonForLeavingList, ReasonForLeavingId};
