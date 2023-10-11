import { Database, ref, get } from "firebase/database";

/**
 * Check if userB is in userA's friend list.
 * 
 * @param {Database} db - The database object against which to validate this conditio
 * @param {string} userA - User ID of the authenticated user.
 * @param {string} userB - User ID of the friend being checked.
 * @returns {Promise<boolean>} - Returns true if userB is a friend of userA, otherwise false.
 */
export async function isFriend(db:Database, userA:string, userB:string):Promise<boolean> {
  const dbRef = ref(db, `/users/${userA}/friends/${userB}`)
  const snapshot = await get(dbRef);
  return snapshot.exists();
};