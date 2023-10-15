import { Database, ref, get } from "firebase/database";
import { ProfileData } from "../types/database";

/**
 * Fetch the profile details of a given user.
 * 
 * @param {Database} db - The database object against which to validate this conditio
 * @param {string} userId - User ID whose profile details need to be fetched.
 * @returns {Promise<ProfileData>} - Returns the user profile data if they exist, otherwise undefined.
 */
export async function fetchUserProfile(db: Database, userId:string):Promise<ProfileData> {
  const dbRef = ref(db, `/users/${userId}/profile`)
  const snapshot = await get(dbRef); 
  return snapshot.val();
};


/**
 * Using a firebase database object and a list of userIds, fetch the profiles of all these users and return them as an array.
 * 
 * @param {Database} db Firebase database object
 * @param {string[]} userIds An array of user IDs to fetch
 * @returns {Promise<ProfileData[]>} An array of profile data objects
 */
export function fetchUserProfiles(db: Database, userIds: string[]): Promise<ProfileData[]> {
  return Promise.all(userIds.map(id => fetchUserProfile(db, id)));
}