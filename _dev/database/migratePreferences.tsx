import { DatabaseProps, FriendsData, PreferencesData, ProfileData, UnitTypesProps, UserData } from "../../src/types/database";
import { getDisplayName } from "./adminUtils";
import { processPrimaryLevelData } from "./migration";
import { modifyAndTestData } from "./migrationTest";

export const transformPreferencesData = async (preferencesData: PreferencesData, userId: string):Promise<PreferencesData> => {
  // Extracting existing properties to construct the new structure
  const first_day_of_week = preferencesData.first_day_of_week ?? null;
  const units_to_colors = preferencesData.units_to_colors ?? null;

  // Placeholder values for new structure. You may want to modify these.
  const units_to_points: UnitTypesProps = {
    'beer': 1,
    'cocktail': 1.5,
    'other': 1,
    'strong_shot': 1,
    'weak_shot': 0.5,
    'wine': 1
  };

  return {
    first_day_of_week,
    units_to_colors,
    units_to_points
  };
};

/**
 * Refactors the user preferences data in the database.
 *
 * This function performs a test modification using a predefined test user ID to ensure 
 * that the transformation process works correctly. If the test succeeds, the function 
 * continues to process and refactor the primary level data of user preferences.
 *
 * @param {any} adminDb - The database instance to read/write data.
 * @returns {Promise<void>} - A promise that resolves when the transformation process is complete.
 *
 * @example
 * 
 * const dbInstance = getDatabaseInstance();
 * refactorPreferencesData(dbInstance);
 *
 * @throws Will throw an error if the test transformation fails.
 */
export const refactorPreferencesData = async (adminDb: any): Promise<void> => {
  try {
      const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";
      const refString = `user_preferences/${testUserId}`;

      const testResult = await modifyAndTestData<PreferencesData>(adminDb, testUserId, refString, transformPreferencesData);

      if (testResult !== true) {
          throw new Error("Refactorization test failed.");
      }

      // Proceed with the refactorization
      await processPrimaryLevelData(adminDb, 'user_preferences', transformPreferencesData);
      console.log("Successfully transformed preferences data");
  } catch (error) {
      console.error("Error in refactorPreferencesData:", error);
  }
};