import {Database, ref, get} from 'firebase/database';
import {NicknameToIdData} from '../types/database';
import {cleanStringForFirebaseKey} from '@src/utils/strings';

/**
 * Using a database object and a nickname to search,
 * fetch the user IDs that belong to that nickname.
 * Return this object if it exists, or an empty object
 * if not.
 *
 * @param {Database} db Firebase Database object.
 * @param {string} searchText The nickname to search for.
 * @returns {Promise<NicknameToIdData|null>} The user IDs
 *  that belong to this nickname
 */
export async function searchDbByNickname(
  db: Database,
  searchText: string,
): Promise<NicknameToIdData | null> {
  const nicknameKey = cleanStringForFirebaseKey(searchText);
  const dbRef = ref(db, `nickname_to_id/${nicknameKey}`);
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    return snapshot.val(); // The nicknames
  }
  return null;
}
