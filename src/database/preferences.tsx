import { Database, ref, child, update, push } from "firebase/database";
import { PreferencesData } from "../types/database";

/** Save preferences data into the database.
 *
 * Throw an error in case the save attempt fails.
 *  */ 
export async function savePreferencesData(
  db: Database, 
  userId: string,
  preferencesData: PreferencesData,
) {
  var updates: {[key: string]: PreferencesData} = {};
  updates['/user_preferences/' + userId] = preferencesData;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to save user preferences: ' + error.message);
  }
};
