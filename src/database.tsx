import { get, ref, onValue, child, off, update, push, remove } from "firebase/database";

/** Read data once using get()
 * 
 * Provide the database object and a user ID and 
 * return all data of that user. Uses get to avoid
 * continuous listening and performance overload.
 * 
 * Use:
 * const [userData, setUserData] = useState<UserData | null>(null);

 * useEffect(() => {
 *   const fetchUserData = async () => {
 *     const data = await readUserDataOnce(db, userId);
 *     setUserData(data);
 *   };

 *   fetchUserData();
 * }, [db, userId]);
 * */
export async function readDataOnce(db: any, refString: string) {
  const userRef = ref(db, `${refString}`);
  try {
    const snapshot = await get(userRef); // One-off fetch
    if(snapshot.exists()) {
      return snapshot.val(); // Return user data
    }
    return null;
  } catch (error:any){
    throw new Error("Failed to retrieve user data:" + error.message);
  }
}

// Main listener for drinking session data changes.
export function listenForDataChanges(
  db: any,
  refString: string,
  onDataChange: (data: any) => void
) {
  const userRef = ref(db, `/${refString}`);
  const listener = onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    onDataChange(data);
  });

  return () => off(userRef, "value", listener);
}

/** Write drinking session data into the database
 *
 * Throw an error in case the database writing fails.
 *  */ 
export async function saveDrinkingSessionData(
  db: any, 
  userId: string, 
  units: number
  ) {
  const newDrinkingSessionKey = push(child(ref(db), 'drinking_sessions/')).key // Generate a new automatic key for the new drinking session
  var updates: {
    [key: string]: {
      session_id: any;
      user_id: string;
      units: number;
      timestamp: number
    } | boolean } = {};
  updates['/drinking_sessions/' + newDrinkingSessionKey] = {
    session_id: newDrinkingSessionKey,
    user_id: userId,
    units: units,
    timestamp: Date.now(),
  };
  updates['/user_drinking_sessions/' + userId + '/' + newDrinkingSessionKey] = true;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to save drinking session data: ' + error.message);
  }
};

/** Remove drinking session data from the database
 *
 * Throw an error in case the database removal fails.
 *  */ 
export async function removeDrinkingSessionData(
  db: any, 
  userId: string,
  sessionKey: string,
) {
  var updates: {[key: string]: any} = {};
  updates['/drinking_sessions/' + sessionKey] = null;
  updates['/user_drinking_sessions/' + userId + '/' + sessionKey] = null;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to remove drinking session data: ' + error.message);
  }
}