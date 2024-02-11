import {BetaKeyList} from './BetaKey';
import Config from './Config';
import {FeedbackList} from './Feedback';
import {NicknameToIdList} from './NicknameToId';
import {PreferencesList} from './Preferences';
import {UnconfirmedDaysList} from './UnconfirmedDays';
import {UserList} from './UserProps';
import {UserDrinkingSessionsList} from './DrinkingSession';
import {UserStatusList} from './UserStatus';

/** Main database props object
 *
 * Not named "Database" to avoid confusion with the Firebase database object.
 */
type DatabaseProps = {
  [x: string]: any;
  beta_keys: BetaKeyList; // beta feature
  config: Config;
  feedback: FeedbackList;
  nickname_to_id: NicknameToIdList;
  user_drinking_sessions: UserDrinkingSessionsList;
  user_preferences: PreferencesList;
  user_status: UserStatusList;
  user_unconfirmed_days: UnconfirmedDaysList;
  users: UserList;
};

export default DatabaseProps;
