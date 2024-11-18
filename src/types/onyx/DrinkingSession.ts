import type {ValueOf} from 'type-fest';
import type {UserID} from './OnyxCommon';
import type {DrinksList} from './Drinks';
import type CONST from '@src/CONST';
import {SelectedTimezone} from './UserData';

type AddDrinksOptions =
  | {timestampOption: 'now'}
  | {timestampOption: 'sessionStartTime'; start_time: number}
  | {timestampOption: 'sessionEndTime'; end_time: number};

type RemoveDrinksOptions = 'removeFromLatest' | 'removeFromEarliest';

type DrinkingSessionId = string;

type DrinkingSessionType = ValueOf<typeof CONST.SESSION_TYPES>;

type DrinkingSession = {
  id?: DrinkingSessionId; // Only used locally - in the database it's the key
  start_time: number;
  end_time: number;
  timezone?: SelectedTimezone;
  drinks?: DrinksList;
  blackout: boolean;
  note: string;
  ongoing?: boolean;
  type: DrinkingSessionType;
  session_type?: string; // TODO: remove in 0.4.x
};

type DrinkingSessionList = Record<DrinkingSessionId, DrinkingSession>;

type DrinkingSessionArray = DrinkingSession[];

type UserDrinkingSessionsList = Record<UserID, DrinkingSessionList>;

export default DrinkingSession;
export type {
  AddDrinksOptions,
  DrinkingSessionArray,
  DrinkingSessionId,
  DrinkingSessionList,
  DrinkingSessionType,
  RemoveDrinksOptions,
  UserDrinkingSessionsList,
};
