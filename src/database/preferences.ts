import type {Database} from 'firebase/database';
import {ref, update} from 'firebase/database';
import type {Preferences} from '../types/onyx';
import DBPATHS from './DBPATHS';

/** Save preferences data into the database.
 *
 * Throw an error in case the save attempt fails.
 *
 * @param db Firebase database object
 * @param userID User ID
 * @param preferencesData New preferences
 * @returns
 */
export async function savePreferencesData(
  db: Database,
  userID: string,
  preferencesData: Preferences,
): Promise<void> {
  const updates: Record<string, Preferences> = {};
  const preferencesRoute = DBPATHS.USER_PREFERENCES_USER_ID.getRoute(userID);
  updates[preferencesRoute] = preferencesData;
  await update(ref(db), updates);
}
