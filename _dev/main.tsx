import { UserRecord } from 'firebase-admin/lib/auth';

import admin from './database/admin';
import { assignAdminRole, listAllAdmins } from "./database/adminUtils";
import { modifyAndTestData } from './database/migrationTest';
import { refactorPreferencesData, transformPreferencesData } from './database/migratePreferences';
import { PreferencesData } from '../src/types/database';
import { refactorUsersData } from './database/migrateUsers';

const adminDb = admin.database();

const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";

async function main() {
    try {
      // await refactorPreferencesData(adminDb);
      await refactorUsersData(adminDb);
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