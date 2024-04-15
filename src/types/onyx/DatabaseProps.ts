import type Config from './Config';
import type {FeedbackList} from './Feedback';
import type {NicknameToIdList} from './NicknameToId';
import type {PreferencesList} from './Preferences';
import type {UnconfirmedDaysList} from './UnconfirmedDays';
import type {UserPropsList} from './UserProps';
import type {UserDrinkingSessionsList} from './DrinkingSession';
import type {UserStatusList} from './UserStatus';
import type {SessionPlaceholderList} from './SessionPlaceholder';

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
  users: UserPropsList;
};

export default DatabaseProps;
