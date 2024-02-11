import {BetaKeyList} from './BetaKey';
import Config from './Config';
import {FeedbackList} from './Feedback';
import {NicknameToIdList} from './NicknameToId';
import {PreferencesList} from './Preferences';
import {UnconfirmedDaysList} from './UnconfirmedDays';
import {UserList} from './UserProps';
import {UserDrinkingSessions} from './UserDrinkingSessions';
import {UserStatusList} from './UserStatus';

/** Main database props object
 *
 * Not named "Database" to avoid confusion with the Firebase database object.
 */
type DatabaseProps = {
  beta_keys: BetaKeyList; // beta feature
  config: Config;
  feedback: FeedbackList;
  nickname_to_id: NicknameToIdList;
  user_drinking_sessions: UserDrinkingSessions;
  user_preferences: PreferencesList;
  user_status: UserStatusList;
  user_unconfirmed_days: UnconfirmedDaysList;
  users: UserList;
};

// UserList
// export type DisplayData = {
//   [user_id: string]: any;
// };

// ProfileList
// export type ProfileList = {
//   [user_id: string]: ProfileData;
// };

// UserStatusList
// export type UserStatusList = {
//   [user_id: string]: UserStatusData;
// };

// Used when rendering drinking session day overview
// export type DrinkingSessionProps = {
//   sessionKey: string; // sessionKey -> session_key
//   session: DrinkingSessionArrayItem;
// };

export default DatabaseProps;
