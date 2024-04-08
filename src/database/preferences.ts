import {Database, ref, update} from 'firebase/database';
import {Preferences} from '../types/onyx';
import DBPATHS from './DBPATHS';

/** Save preferences data into the database.
 *
 * Throw an error in case the save attempt fails.
 *
 * @param db Firebase database object
 * @param userId User ID
 * @param preferencesData New preferences
 * @returns
 */
export async function savePreferencesData(
  db: Database,
  userId: string,
  preferencesData: Preferences,
): Promise<void> {
  var updates: {[key: string]: Preferences} = {};
  const preferencesRoute = DBPATHS.USER_PREFERENCES_USER_ID.getRoute(userId);
  updates[preferencesRoute] = preferencesData;
  await update(ref(db), updates);
}
