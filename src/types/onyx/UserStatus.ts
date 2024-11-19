import type {UserID} from './OnyxCommon';
import type DrinkingSession from './DrinkingSession';

type UserStatus = {
  last_online: number;
  latest_session_id?: string | null;
  latest_session?: DrinkingSession | null;
};

type UserStatusList = Record<UserID, UserStatus>;

export default UserStatus;
export type {UserStatusList};
