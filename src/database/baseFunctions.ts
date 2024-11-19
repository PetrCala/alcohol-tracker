import type {Database} from 'firebase/database';
import {get, ref, child, push, onValue, off} from 'firebase/database';
import type {
  DrinkingSession,
  Profile,
  ProfileList,
  UserStatusList,
} from '@src/types/onyx';
import type {UserID} from '@src/types/onyx/OnyxCommon';
import DBPATHS from './DBPATHS';
import {Diff} from 'deep-diff';

/** Read data once from the realtime database using get(). Return the data if it exists.
 *
 * @param {Database} db The Realtime Database instance.
 * @param {string} refString Ref string to listen at
 * @returns {Promsise<any|null>}
 *
 * */
export async function readDataOnce(
  db: Database,
  refString: string,
): Promise<any | null> {
  const userRef = ref(db, refString);
  const snapshot = await get(userRef); // One-off fetch
  if (snapshot.exists()) {
    return snapshot.val(); // Return user data
  }
  return null;
}

/**
 * Main listener for data changes
 *
 * @param db The Realtime Database instance.
 * @param refString Ref string to listen at
 * @param onDataChange Callback function to execute on data change.
 */
export function listenForDataChanges(
  db: Database,
  refString: string,
  onDataChange: (data: any) => void,
) {
  const dbRef = ref(db, refString);
  const listener = onValue(dbRef, snapshot => {
    let data: any = null;
    if (snapshot.exists()) {
      data = snapshot.val();
    }
    onDataChange(data);
  });

  return () => off(dbRef, 'value', listener);
}

/**
 * Fetch the Firebase nickname of a user given their UID.
 * @param {Database} db The Realtime Database instance.
 * @param {string} uid The user's UID.
 * @returns{Promise<string|null>} The nickname or null if not found.
 *
 * @example const userNickname = await fetchNicknameByUID(db, "userUIDHere");
 */
export async function fetchNicknameByUID(
  db: Database,
  uid: string,
): Promise<string | null> {
  const userRef = ref(db, DBPATHS.USERS_USER_ID_PROFILE.getRoute(uid));
  const userSnapshot = await get(userRef);
  if (!userSnapshot.exists()) {
    // console.error("No user found for the given UID.");
    return 'Not found';
  }
  return userSnapshot.val().display_name || null;
}

/**
 * Generates a database key based on the provided reference string.
 *
 * @param db The database object.
 * @param refString The reference string used to generate the key.
 * @returns The generated database key, or null if the key cannot be generated.
 */
export function generateDatabaseKey(
  db: Database,
  refString: string,
): string | null {
  return push(child(ref(db), refString)).key;
}

/**
 * Fetches profile data for multiple users from the database.
 *
 * @param db - The database instance.
 * @param userIDs - An array of user IDs.
 * @param refTemplate - The reference template for fetching user data. Must contain the string '{userID}'.
 * @returns A promise that resolves to an array of profile data.
 */
export function fetchDataForUsers(
  db: Database,
  userIDs: UserID[],
  refTemplate: string,
): Promise<Profile[]> {
  if (!userIDs || userIDs.length === 0) {
    return Promise.resolve([]);
  }
  if (!refTemplate.includes('{userID}')) {
    throw new Error('Invalid ref template');
  }
  return Promise.all(
    userIDs.map(id => readDataOnce(db, refTemplate.replace('{userID}', id))),
  );
}

/**
 * Fetches display data for the given user IDs.
 *
 * @param db - The database instance.
 * @param userIDs - An array of user IDs.
 * @param refTemplate - The reference template for fetching user data. Must contain the string '{userID}'.
 * @returns A promise that resolves to an object containing the display data.
 */
export async function fetchDisplayDataForUsers(
  db: Database | undefined,
  userIDs: UserID[],
  refTemplate: string,
): Promise<ProfileList | UserStatusList> {
  const newDisplayData: ProfileList = {};
  if (db && userIDs) {
    const data: any[] = await fetchDataForUsers(db, userIDs, refTemplate);
    userIDs.forEach((id, index) => {
      newDisplayData[id] = data[index];
    });
  }
  return newDisplayData;
}

export function differencesToUpdates(
  differences: Diff<any, any>[],
): Partial<DrinkingSession> {
  const updates: any = {};

  differences.forEach(difference => {
    const path = difference.path || [];

    if (path.length === 0) {
      return; // Ignore if path is empty
    }

    // Build the nested updates object based on the path
    let current = updates;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = path[path.length - 1];

    if (difference.kind === 'A') {
      // Handle array changes
      const index = difference.index;
      const arrayPath = [...(difference.path || []), index];
      // Build the nested updates object based on the array path
      let current = updates;
      for (let i = 0; i < arrayPath.length - 1; i++) {
        const key = arrayPath[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      const lastKey = arrayPath[arrayPath.length - 1];
      current[lastKey] = difference.item?.rhs;
    } else if (difference.kind === 'N' || difference.kind === 'E') {
      // For new, edited, or array changes
      current[lastKey] = difference.rhs;
    } else if (difference.kind === 'D') {
      // For deleted properties, set to null or handle deletion accordingly
      current[lastKey] = null; // Or you can decide how to handle deletions
    }
  });

  return updates;
}
