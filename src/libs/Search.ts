import {Database, ref, get} from 'firebase/database';
import {cleanStringForFirebaseKey} from '@libs/StringUtilsKiroku';
import {QUIRKY_NICKNAMES} from '@libs/QuirkyNicknames';
import {
  UserIdToNicknameMapping,
  UserSearchResults,
} from '@src/types/various/Search';
import {NicknameToId} from '@src/types/onyx';

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
async function searchDbByNickname(
  db: Database,
  searchText: string,
): Promise<NicknameToId | null> {
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
async function searchDatabaseForUsers(
  db: Database | undefined,
  searchText: string,
  useQuirkyNicknames: boolean = true,
): Promise<UserSearchResults> {
  if (!searchText || !db) {
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

function searchItemIsRelevant(
  item: string,
  cleanedText: string,
  mapping: UserIdToNicknameMapping,
): boolean {
  const mappingText = mapping[item];
  if (mappingText) {
    const cleanedMappingText = cleanStringForFirebaseKey(mappingText);
    return cleanedMappingText.includes(cleanedText);
  }
  return false;
}

function searchArrayByText(
  arr: string[],
  searchText: string,
  mapping: UserIdToNicknameMapping,
): string[] {
  if (!searchText) return arr;
  const cleanedSearchText = cleanStringForFirebaseKey(searchText);
  return arr.filter(item =>
    searchItemIsRelevant(item, cleanedSearchText, mapping),
  );
}

function searchObjectByText(
  obj: Record<string, any>,
  searchText: string,
  mapping: UserIdToNicknameMapping,
): Record<string, any> {
  if (!searchText) return obj;
  const cleanedSearchText = cleanStringForFirebaseKey(searchText);
  return Object.keys(obj)
    .filter(key => searchItemIsRelevant(key, cleanedSearchText, mapping))
    .reduce(
      (acc, key) => {
        acc[key] = obj[key];
        return acc;
      },
      {} as Record<string, any>,
    );
}

export {
  searchDbByNickname,
  searchDatabaseForUsers,
  searchArrayByText,
  searchObjectByText,
};
