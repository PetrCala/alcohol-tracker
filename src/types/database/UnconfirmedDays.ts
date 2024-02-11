import {UserId} from './DatabaseCommon';

type UnconfirmedDayKey = string;

type UnconfirmedDays = Record<UnconfirmedDayKey, boolean>;

type UnconfirmedDaysList = Record<UserId, UnconfirmedDays>;

export default UnconfirmedDays;
export type {UnconfirmedDaysList, UnconfirmedDayKey};
