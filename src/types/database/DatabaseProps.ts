import Config from './Config';
import {FeedbackList} from './Feedback';
import {NicknameToIdList} from './NicknameToId';
import {PreferencesList} from './Preferences';
import {UnconfirmedDaysList} from './UnconfirmedDays';
import {UserList} from './UserProps';
import {UserDrinkingSessionsList} from './DrinkingSession';
import {UserStatusList} from './UserStatus';
import {SessionPlaceholderList} from './SessionPlaceholder';

/** Main database props object
 *
 * Not named "Database" to avoid confusion with the Firebase database object.
 */
type DatabaseProps = {
  config: Config;
  feedback: FeedbackList;
  nickname_to_id: NicknameToIdList;
  user_drinking_sessions: UserDrinkingSessionsList;
  user_preferences: PreferencesList;
  user_session_placeholder: SessionPlaceholderList;
  user_status: UserStatusList;
  user_unconfirmed_days: UnconfirmedDaysList;
  users: UserList;
};

export default DatabaseProps;
