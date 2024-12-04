import type {UserID} from './OnyxCommon';
import type DrinkingSession from './DrinkingSession';

type UserStatus = {
  /** A timestamp indicating the last time a user was online */
  last_online: number;

  /** ID of the latest drinking session */
  latest_session_id?: string | null;

  /** The user's latest drinking session data */
  latest_session?: DrinkingSession | null;
};

type UserStatusList = Record<UserID, UserStatus>;

export default UserStatus;
export type {UserStatusList};
