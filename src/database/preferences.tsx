import {Database, ref, child, update, push} from 'firebase/database';
import {Preferences} from '../types/database';

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
  updates['/user_preferences/' + userId] = preferencesData;
  await update(ref(db), updates);
}
