import {UserId} from './DatabaseCommon';
import {DrinksList} from './Drinks';

type DrinkingSessionId = string;

type DrinkingSession = {
  start_time: number;
  end_time: number;
  drinks?: DrinksList;
  blackout: boolean;
  note: string;
  ongoing?: boolean;
};

type DrinkingSessionList = Record<DrinkingSessionId, DrinkingSession>;

type DrinkingSessionArray = Array<DrinkingSession>;

type UserDrinkingSessionsList = Record<UserId, DrinkingSessionList>;

export default DrinkingSession;
export type {
  DrinkingSessionId,
  DrinkingSessionList,
  DrinkingSessionArray,
  UserDrinkingSessionsList,
};
