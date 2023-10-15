import { Database, ref, child, update, push } from "firebase/database";
import { DatabaseProps, PreferencesData } from "../types/database";

/** Save preferences data into the database.
 *
 * Throw an error in case the save attempt fails.
 * 
 * @param {DatabaseProps} db Firebase database object
 * @param {string} userId User ID
 * @param {PreferencesData} preferencesData New preferences
 * @returns {Promise<void>}
 */ 
export async function savePreferencesData(
  db: Database, 
  userId: string,
  preferencesData: PreferencesData,
): Promise<void> {
  var updates: {[key: string]: PreferencesData} = {};
  updates['/user_preferences/' + userId] = preferencesData;
  await update(ref(db), updates);
};
