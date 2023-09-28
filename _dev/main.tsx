import { UserRecord } from 'firebase-admin/lib/auth';

import admin from './database/admin';
import { assignAdminRole, listAllAdmins } from "./database/adminUtils";

const adminDb = admin.database();

async function main() {
    try {
      await listAllAdmins().then(admins => {
        admins.forEach((admin: UserRecord) => {
            console.log(`UID: ${admin.uid}, Email: ${admin.email}`);
        });
    });
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      process.exit(0);
    };
};

main();