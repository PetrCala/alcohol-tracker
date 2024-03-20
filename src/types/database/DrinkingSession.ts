import {ValueOf} from 'type-fest';
import {UserId} from './DatabaseCommon';
import {DrinksList} from './Drinks';
import CONST from '@src/CONST';

type DrinkingSessionId = string;

type DrinkingSessionType = ValueOf<typeof CONST.SESSION_TYPES>;

type DrinkingSession = {
  start_time: number;
  end_time: number;
  drinks?: DrinksList;
  blackout: boolean;
  note: string;
  ongoing?: boolean;
  type: DrinkingSessionType;
};

type DrinkingSessionList = Record<DrinkingSessionId, DrinkingSession>;

type DrinkingSessionArray = Array<DrinkingSession>;

type UserDrinkingSessionsList = Record<UserId, DrinkingSessionList>;

export default DrinkingSession;
export type {
  DrinkingSessionArray,
  DrinkingSessionId,
  DrinkingSessionList,
  DrinkingSessionType,
  UserDrinkingSessionsList,
};
