import { get, ref, onValue, off, push, onDisconnect, set, serverTimestamp } from "firebase/database";

/** Read data once using get()
 * 
 * Provide the database object and a user ID and 
 * return all data of that user. Uses get to avoid
 * continuous listening and performance overload.
 * */
export async function readDataOnce(db: any, refString: string) {
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
  db: any,
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
