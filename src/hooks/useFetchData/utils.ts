import {UserId} from '@src/types/database';
import {FetchDataKey} from './types';
import DBPATHS from '@database/DBPATHS';

/** Given a database base key, fetch the full route to the database node
 * for a specific user.
 */
function fetchDataKeyToDbPath(key: FetchDataKey, userId: UserId) {
  let path;
  switch (key) {
    case 'userStatusData':
      path = DBPATHS.USER_STATUS_USER_ID.getRoute(userId);
      break;
    case 'drinkingSessionData':
      path = DBPATHS.USER_DRINKING_SESSIONS_USER_ID.getRoute(userId);
      break;
    case 'preferences':
      path = DBPATHS.USER_PREFERENCES_USER_ID.getRoute(userId);
      break;
    case 'unconfirmedDays':
      path = DBPATHS.USER_UNCONFIRMED_DAYS_USER_ID.getRoute(userId);
      break;
    case 'userData':
      path = DBPATHS.USERS_USER_ID.getRoute(userId);
      break;
  }
  if (path) {
    return path;
  }
  return null;
}

export {fetchDataKeyToDbPath};
