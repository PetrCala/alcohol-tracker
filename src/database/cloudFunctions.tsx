import { NicknameToIdData, PreferencesData, ProfileData, UserData } from "src/types/database";
import admin from "./admin";
import { cleanStringForFirebaseKey } from "@utils/strings";
import { getDefaultPreferences, getDefaultUserData } from "./users";

/** In the database, create base info for a user. This will
 * be stored under the "users" object in the database.
 * 
 * @param {admin.database.Database} db The firebase admin database object
 * @param {string} userId The user ID
 * @param {ProfileData} profileData Profile data of the user to create
 * @param {string} betaKeyId Beta key // Beta feature
 * @returns {Promise<void>}
 */
async function pushNewUserInfo(
 db: admin.database.Database,
 userId: string,
 profileData: ProfileData,
 betaKeyId: string, // Beta feature
):Promise<void>{
  const userNickname = profileData.display_name;
  const nicknameKey = cleanStringForFirebaseKey(userNickname);
  // Allowed types
  let updates: {
    [key:string]: UserData | PreferencesData | NicknameToIdData | any;
  } = {};
  // Nickname to ID
  updates[`nickname_to_id/${nicknameKey}/${userId}`] = userNickname;
  // User preferences
  updates[`user_preferences/${userId}`] = getDefaultPreferences();
  // Users
  updates[`users/${userId}`] = getDefaultUserData(profileData, betaKeyId);
  // Beta feature
  updates[`beta_keys/${betaKeyId}/in_usage`] = true;
  updates[`beta_keys/${betaKeyId}/user_id`] = userId;
  await db.ref().update(updates);
};

