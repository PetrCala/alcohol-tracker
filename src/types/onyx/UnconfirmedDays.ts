import type {UserID} from './OnyxCommon';

/** A day string representing a day on which the consumption is unconfirmed by the user */
type UnconfirmedDayKey = string;

/** A collection of days when the consumption is unconfirmed by the user */
type UnconfirmedDays = Record<UnconfirmedDayKey, boolean>;

/** A collection of unconfirmed days */
type UnconfirmedDaysList = Record<UserID, UnconfirmedDays>;

export default UnconfirmedDays;
export type {UnconfirmedDaysList, UnconfirmedDayKey};
