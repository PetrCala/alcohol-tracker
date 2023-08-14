import { update, runTransaction, ref } from "firebase/database";

/** In the database, create base info for a user. This will
 * be stored under the "users" object in the database.
 * 
 * @param db The database object
 * @param userId The user ID
 */
export async function pushNewUserInfo(
 db: any,
 userId: string,
){
  let timestampNow = new Date().getTime();
  let updates: {[key:string]: number | boolean} = {};
  updates[`users/${userId}/current_timestamp`] = timestampNow;
  updates[`users/${userId}/current_units`] = 0;
  updates[`users/${userId}/in_session`] = false;
  try {
    await update(ref(db), updates)
  } catch (error:any) {
    throw new Error('Failed to create new user info: ' + error.message);
  } 
}



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
