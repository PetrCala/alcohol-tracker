import type {UserID} from './OnyxCommon';

type UnconfirmedDayKey = string;

type UnconfirmedDays = Record<UnconfirmedDayKey, boolean>;

type UnconfirmedDaysList = Record<UserID, UnconfirmedDays>;

export default UnconfirmedDays;
export type {UnconfirmedDaysList, UnconfirmedDayKey};
