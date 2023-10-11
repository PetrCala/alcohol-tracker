import { Database, ref, get } from "firebase/database";

/**
 * Fetch the profile details of a given user.
 * 
 * @param {Database} db - The database object against which to validate this conditio
 * @param {string} userId - User ID whose profile details need to be fetched.
 * @returns {Promise<Object>} - Returns the user profile object if exists, otherwise undefined.
 */
export async function fetchUserProfile(db: Database, userId:string):Promise<Object> {
  const dbRef = ref(db, `/users/${userId}/profile`)
  const snapshot = await get(dbRef); 
  return snapshot.val();
};
