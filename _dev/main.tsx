import { UserRecord } from 'firebase-admin/lib/auth';

import admin from './database/admin';
import { assignAdminRole, listAllAdmins } from "./database/adminUtils";
import { modifyAndTestUser } from './database/migrationTest';
import { refactorUsersData } from './database/migration';

const adminDb = admin.database();

async function main() {
    try {
    // Example usage
    // const userId = "sR7BxAtjQCbAKkOOMRBUByfDKh73";
    // await modifyAndTestUser(adminDb, userId);
    // await refactorUsersData(adminDb);
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