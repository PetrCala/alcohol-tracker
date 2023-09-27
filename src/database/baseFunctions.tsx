import { Database, get, ref, onValue, off } from "firebase/database";

/** Read data once using get()
 * 
 * Provide the database object and a user ID and 
 * return all data of that user. Uses get to avoid
 * continuous listening and performance overload.
 * */
export async function readDataOnce(db: Database, refString: string) {
  const userRef = ref(db, refString);
  try {
    const snapshot = await get(userRef); // One-off fetch
    if(snapshot.exists()) {
      return snapshot.val(); // Return user data
    }
    return null;
  } catch (error:any){
    throw new Error("Failed to retrieve user data:" + error.message);
  };
}

// Main listener for drinking session data changes.
export function listenForDataChanges(
  db: Database,
  refString: string,
  onDataChange: (data: any) => void
) {
  const dbRef = ref(db, refString);
  const listener = onValue(dbRef, (snapshot) => {
    let data:any = null;
    if (snapshot.exists()){
      data = snapshot.val();
    }
    onDataChange(data);
  });

  return () => off(dbRef, "value", listener);
}


/**
 * Fetch the Firebase nickname of a user given their UID.
 * @param {Database} db The Realtime Database instance.
 * @param {string} uid The user's UID.
 * @return {Promise<string|null>} The nickname or null if not found.
 * 
 * @example const userNickname = await fetchNicknameByUID(db, "userUIDHere");
 */
export async function fetchNicknameByUID(db: Database, uid: string): Promise<string | null> {
  try {
    const userRef = ref(db, `users/${uid}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      console.error("No user found for the given UID.");
      return null;
    }

    return userSnapshot.val().nickname || null;
  } catch (error) {
    console.error("Error fetching user nickname:", error);
    return null;
  }
};