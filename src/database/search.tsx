import {Database, ref, get} from 'firebase/database';
import {NicknameToIdData} from '@src/types/database';
import {cleanStringForFirebaseKey} from '@src/utils/strings';
import {QUIRKY_NICKNAMES} from '@src/utils/QuirkyNicknames';
import {UserSearchResults} from '@src/types/search';

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

/**
 * Searches the database for a given searchText and returns a string of IDs that match the search text.
 * @param db - The database object.
 * @param searchText - The text to search for.
 * @param useQuirkyNicknames - Whether to include quirky nicknames in the search results. Default is true.
 * @returns A Promise that resolves to a string of IDs that match the search text.
 */
export async function searchDatabaseForUsers(
  db: Database | null,
  searchText: string,
  useQuirkyNicknames: boolean = true,
): Promise<UserSearchResults> {
  if (!db || !searchText) {
    return [];
  }
  let searchResultData: UserSearchResults = [];
  const newResults = await searchDbByNickname(db, searchText); // Nickname is cleaned in the function
  if (newResults) {
    searchResultData = Object.keys(newResults);
  }
  if (useQuirkyNicknames && QUIRKY_NICKNAMES[searchText]) {
    searchResultData.push(searchText);
  }
  return searchResultData;
}
