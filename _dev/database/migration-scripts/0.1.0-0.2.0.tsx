import admin from '../admin';
import { refactorPreferencesData } from '../migratePreferences';
import { refactorUsersData } from '../migrateUsers';

const adminDb = admin.database();

/**
 * Migrate from the 0.1.0 version of the database to database applicable
 * to app versions 0.2.0 and above. Automatically validates that the
 * transformation can be made, and exits if it can not.
 * 
 * WARNING: Do not run if any of the Preferences Data and Users Data
 *  have had major changes to them done since the 0.2.0 version of the app.
 *  Indeed, this is meant as a run-once type of script.
 * 
 * @description
 *  Preferences Data changes:
 *  -   units_to_points field added
 * 
 *  User Data changes:
 *  -   friends field added
 *  -   profile field added
 * 
 * @version <=0.2.0
 */
async function main() {
    try {
      await refactorPreferencesData(adminDb);
      await refactorUsersData(adminDb);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  };
};

// main();