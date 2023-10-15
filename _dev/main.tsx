import admin from './database/admin';
import { assignAdminRole, listAllAdmins } from "./database/adminUtils";
import { refactorPreferencesData, transformPreferencesData } from './database/migration-scripts/0.1.0-0.2.0/migratePreferences';
import { PreferencesData } from '../src/types/database';
import { refactorUsersData } from './database/migration-scripts/0.1.0-0.2.0/migrateUsers';
import { updateAllNicknameToIdData } from './database/migration-scripts/0.2.0-0.2.8/addNicknameToIdTable';

const adminDb = admin.database();

const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";

async function main() {
    try {
      // await refactorPreferencesData(adminDb);
      // await refactorUsersData(adminDb);
      // await updateAllNicknameToIdData(adminDb) // Profile nickname to nickname_to_id
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  };
};

main();

//   await listAllAdmins().then(admins => {
//     admins.forEach((admin: UserRecord) => {
//         console.log(`UID: ${admin.uid}, Email: ${admin.email}`);
//     });
// });