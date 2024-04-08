import {UserId} from './DatabaseCommon';
import DrinkingSession from './DrinkingSession';

type UserStatus = {
  last_online: number;
  latest_session_id?: string;
  latest_session?: DrinkingSession;
};

type UserStatusList = Record<UserId, UserStatus>;

export default UserStatus;
export type {UserStatusList};
