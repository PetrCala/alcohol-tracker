import { DatabaseProps, FriendsData, ProfileData, UserData } from "../../src/types/database";
import { getDisplayName } from "./adminUtils";
import { processPrimaryLevelData } from "./migration";
import { modifyAndTestData } from "./migrationTest";

export const transformUserData = async (userData: UserData, userId: string):Promise<UserData> => {
  // Extracting existing properties to construct the new structure
  const role = userData.role ?? null;
  const last_online = userData.last_online ?? null;
  const beta_key_id = userData.beta_key_id ?? null;
  let profile:ProfileData = userData.profile ?? null;
  let friends:FriendsData = userData.friends ?? null;
  // Create the profile data if not available - from version 0.2.0
  if (!profile){
    let username:string = "";
    try {
      let newUsername = await getDisplayName(userId);
      if (newUsername) {
        username = newUsername;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    profile = {
        display_name: username,
        photo_url: ""
    };
  };
  // Create friends data if not available - from version 0.2.0
  if (!friends){
    friends = {};
  };

  return {
      profile,
      friends,
      role,
      last_online,
      beta_key_id
  };
};

/**
 * Refactors the primary user data in the database.
 *
 * This function processes and refactors the primary level data of users.
 *
 * @param {any} adminDb - The database instance to read/write data.
 * @returns {Promise<void>} - A promise that resolves when the transformation process is complete.
 *
 * @example
 * 
 * const dbInstance = getDatabaseInstance();
 * refactorUsersData(dbInstance);
 *
 * @throws Will throw an error if there's any issue in the transformation process.
 */
export const refactorUsersData = async (adminDb: any): Promise<void> => {
  try {
      const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";
      const refString = `user_preferences/${testUserId}`;

      const testResult = await modifyAndTestData<UserData>(adminDb, testUserId, refString, transformUserData);

      if (testResult !== true) {
          throw new Error("Refactorization test failed.");
      }

      // Proceed with the refactorization
      await processPrimaryLevelData(adminDb, 'users', transformUserData);
      console.log("Successfully transformed user data");
  } catch (error) {
      console.error("Error in refactorUsersData:", error);
  }
};