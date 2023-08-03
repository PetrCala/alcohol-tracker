import { get, ref, onValue, child, off, update, push, runTransaction } from "firebase/database";
import { getSingleDayDrinkingSessions } from "./utils/dataHandling";

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
  dataToArray: boolean,
  onDataChange: (data: any) => void
) {
  const dbRef = ref(db, `/${refString}`);
  const listener = onValue(dbRef, (snapshot) => {
    let data = snapshot.val();
    if (dataToArray) {
      data = Object.values(data); // To an array
    };
    onDataChange(data);
  });

  return () => off(dbRef, "value", listener);
}

/**
 * Handle a listener that will query all of today's
 * drinking sessions
 */
export function listenForAllSingleDaySessions(
  db: any,
  userId: any,
  day: Date,
  onDataChange: (data: any) => void
) {
  const dbRef = ref(db, `/user_drinking_sessions/${userId}`);
  const listener = onValue(dbRef, (snapshot) => {
    let data = snapshot.val();
    data = Object.values(data); // To an array
    data = getSingleDayDrinkingSessions(day, data);
    onDataChange(data);
  });

  return () => off(dbRef, "value", listener);
}; 


/** Write drinking session data into the database
 *
 * Throw an error in case the database writing fails.
 *  */ 
export async function saveDrinkingSessionData(
  db: any, 
  userId: string, 
  units: number,
  timestamp: number
  ) {
  const newDrinkingSessionKey = push(child(ref(db), `/user_drinking_sessions/${userId}/`)).key // Generate a new automatic key for the new drinking session
  var updates: {
    [key: string]: {
      session_id: any;
      units: number;
      timestamp: number
    } | {
      current_units: number;
      in_session: boolean;
    }} = {};
  updates[`/user_drinking_sessions/${userId}/` + newDrinkingSessionKey] = {
    session_id: newDrinkingSessionKey,
    units: units,
    timestamp: timestamp,
  };
  updates[`users/${userId}`] = {
    current_units: 0,
    in_session: false,
  };

  try {
    await update(ref(db), updates);
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
  updates['/user_drinking_sessions/' + userId + '/' + sessionKey] = null;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to remove drinking session data: ' + error.message);
  }
}



export async function updateDrinkingSessionUserData(
  db: any,
  updates: {[key: string]: any},
) {
  try {
      await update(ref(db), updates);
  } catch (error: any) {
      throw new Error('Failed to update user data: ' + error.message);
  }
};


export async function updateCurrentTimestamp(
  db: any, 
  userId: string, 
  timestamp: number,
  ) {
  let updates: {[key: string]: number} = {};
  updates[`users/${userId}/current_timestamp`] = timestamp;

  try {
    await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to update session timestamp: ' + error.message);
  }
};


export async function updateCurrentUnits(
  db: any, 
  userId: string, 
  units: number
  ) {
  try {
    await runTransaction(ref(db, `users/${userId}`), (user) => {
      if (user) {
        user.current_units = units;
      }
      return user;
    });
  } catch (error:any) {
    throw new Error('Failed to save drinking session data: ' + error.message);
  }
};

export async function updateSessionStatus(
  db: any, 
  userId: string, 
  status: boolean,
  ) {
  let updates: {[key: string]: boolean} = {};
  updates[`users/${userId}/in_session`] = status;

  try {
    await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to save drinking session data: ' + error.message);
  }
};

export async function discardDrinkingSessionData(
 db: any,
 userId: string,
){
  let updates: {[key:string]: number | boolean} = {};
  updates[`users/${userId}/current_units`] = 0;
  updates[`users/${userId}/in_session`] = false;
  try {
    await update(ref(db), updates)
  } catch (error:any) {
    throw new Error('Failed to add a new unit: ' + error.message);
  } 
}
