import {UnitsList} from './Units';

type DrinkingSessionId = string;

type DrinkingSession = {
  start_time: number;
  end_time: number;
  units: UnitsList;
  blackout: boolean;
  note: string;
  ongoing?: boolean;
};

type DrinkingSessionList = Record<DrinkingSessionId, DrinkingSession>;

type DrinkingSessionArray = Array<DrinkingSession>;

export default DrinkingSession;
export type {DrinkingSessionId, DrinkingSessionList, DrinkingSessionArray};
