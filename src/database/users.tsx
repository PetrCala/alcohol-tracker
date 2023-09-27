import { Database, update, runTransaction, ref } from "firebase/database";
import { PreferencesData, UserData, UnitsToColorsData } from "../types/database";
import { appInBeta } from "../utils/static";
import { EmailAuthProvider, User, UserCredential, reauthenticateWithCredential } from "firebase/auth";
import { Alert } from "react-native";

/** In the database, create base info for a user. This will
 * be stored under the "users" object in the database.
 * 
 * @param db The database object
 * @param userId The user ID
 */
export async function pushNewUserInfo(
 db: Database,
 userId: string,
 betaKeyId: string, // Beta feature
){
  // User current session
  let timestampNow = new Date().getTime();
  // User preferences
  let newUnitsToColors:UnitsToColorsData = {
    orange: 10,
    yellow: 5,
  }
  let newPreferences:PreferencesData = {
    first_day_of_week: 'Monday',
    units_to_colors: newUnitsToColors,
  };
  // Users
  let userRole = appInBeta ? 'beta_user' : 'user'; // Beta feature
  let newUserData:UserData = {
    role: userRole,
    last_online: timestampNow,
    beta_key_id: betaKeyId, // Beta feature
  };
  // Allowed types
  let updates: {
    [key:string]: UserData | PreferencesData | any
  } = {};
  // User preferences
  updates[`user_preferences/${userId}`] = newPreferences;
  // Users
  updates[`users/${userId}`] = newUserData;
  // Beta feature
  updates[`beta_keys/${betaKeyId}/in_usage`] = true;
  updates[`beta_keys/${betaKeyId}/user_id`] = userId;
  try {
    await update(ref(db), updates)
  } catch (error:any) {
    throw new Error('Failed to create new user info: ' + error.message);
  } ;
};


/** Delete all user info from the realtime database, including their 
 * user information, drinking sessions, etc.
 * 
 * @param db The database object
 * @param userId The user ID
 */
export async function deleteUserInfo(
 db: Database,
 userId: string,
 betaKeyId: string | undefined, // Beta feature
){
  let updates: {[key:string]: null | false} = {}; 
  updates[`users/${userId}`] = null;
  updates[`user_current_session/${userId}`] = null;
  updates[`user_preferences/${userId}`] = null;
  updates[`user_drinking_sessions/${userId}`] = null;
  updates[`user_unconfirmed_days/${userId}`] = null;
  // Beta feature
  if (betaKeyId){ // Reset the beta key to a usable form
    updates[`beta_keys/${betaKeyId}/in_usage`] = false;
    updates[`beta_keys/${betaKeyId}/user_id`] = null;
  };
  try {
    await update(ref(db), updates)
  } catch (error:any) {
    throw new Error('Failed to delete user info: ' + error.message);
  } ;
};


export async function updateUserLastOnline(
  db: Database,
  userId: string,
 ){
  let lastOnline:number = new Date().getTime();
  let updates: {[key:string]: number} = {};
  updates[`users/${userId}/last_online`] = lastOnline;
  try {
    await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to update user online status: ' + error.message);
  };
};

/** Reauthentificate a user using the User object and a password
 * Necessary before important operations such as deleting a user 
 * or changing a password.
 * 
 * Return a promise with the credentials if the reauthentification succeeds,
 * or with null if it does not.
 * 
 * @param user User object from firebase
 * @param password Password to reauthentificate with
 */
export async function reauthentificateUser(user: User, password: string): Promise<UserCredential | null>{
    let email:string;
    if (user.email){
      email = user.email;
    } else {
      Alert.alert("User email not found", "This user has no email");
      return null;
    };
    const credential = EmailAuthProvider.credential(
        email,
        password
    );
    try {
      var result = await reauthenticateWithCredential(
        user, 
        credential
      );
      return result;
    } catch (error:any){
      Alert.alert("Reauthentification failed", "Failed to reauthentificated this user");
      return null;
    };
}