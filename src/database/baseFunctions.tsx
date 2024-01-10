import {Database, get, ref, child, push, onValue, off} from 'firebase/database';

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
 * @return {Promise<string|null>} The nickname or null if not found.
 *
 * @example const userNickname = await fetchNicknameByUID(db, "userUIDHere");
 */
export async function fetchNicknameByUID(
  db: Database,
  uid: string,
): Promise<string | null> {
  const userRef = ref(db, `users/${uid}/profile`);
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