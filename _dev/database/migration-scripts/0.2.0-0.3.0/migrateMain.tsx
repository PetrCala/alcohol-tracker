import admin from '../../../../src/database/admin';
import addNicknameToIdTable from './addNicknameToIdTable';

const adminDb = admin.database();

/**
 * Migrate from the 0.2.0 version of the database to database applicable
 * to app versions 0.3.0 and above. Automatically validates that the
 * transformation can be made, and exits if it can not.
 * 
 * @description
 *  Major changes:
 *  -   nickname_to_id table added
 * 
 * @version 0.2.0-0.3.0
 */
async function migrate_020_030() {
    try {
      await addNicknameToIdTable(adminDb)
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  };
};

export default migrate_020_030;