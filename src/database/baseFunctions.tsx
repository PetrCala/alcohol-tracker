import { get, ref, onValue, off } from "firebase/database";
import { ValidDatabaseRefs } from "../types/database";
import { useState, useEffect } from "react";


function getFirebaseRef(path: ValidDatabaseRefs): string {
    return path;
}


/** Read data once using get()
 * 
 * Provide the database object and a user ID and 
 * return all data of that user. Uses get to avoid
 * continuous listening and performance overload.
 * */
export async function readDataOnce(db: any, refString: string) {
  const validRef = getFirebaseRef(refString);
  const userRef = ref(db, validRef);
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
  refString: ValidDatabaseRefs,
  onDataChange: (data: any) => void
) {
  const validRef = getFirebaseRef(refString);
  const dbRef = ref(db, validRef);
  const listener = onValue(dbRef, (snapshot) => {
    let data:any = null;
    if (snapshot.exists()){
      data = snapshot.val();
    }
    onDataChange(data);
  });

  return () => off(dbRef, "value", listener);
}