import { UserRecord } from 'firebase-admin/lib/auth';

import admin from "./admin";

/**
 * Lists all users with the 'admin' custom claim.
 * 
 * This function fetches users in batches, checks for the presence of the 'admin' custom claim,
 * and accumulates those users into an array. The batch size is set to 1000 users per call,
 * and pagination is used to fetch subsequent batches.
 * 
 * @returns Promise that resolves to an array of UserRecord objects for users with the 'admin' claim.
 * @throws {Error} Throws an error if fetching users fails.
 */
export async function listAllAdmins(): Promise<UserRecord[]> {
  const admins: UserRecord[] = [];
  let nextPageToken;

  do {
      const listUsersResult:any = await admin.auth().listUsers(1000, nextPageToken);
  
      listUsersResult.users.forEach((userRecord: UserRecord) => {
        const customClaims = userRecord.customClaims || {};
        if (customClaims.admin) {
          admins.push(userRecord);
        }
      });
  
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
  
    return admins;
};

/**
 * Assigns the admin role to a specified user by UID.
 * 
 * @param uid User ID of the user to be assigned the admin role.
 * @returns Promise indicating the operation's completion.
 */
export async function assignAdminRole(uid: string): Promise<void> {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Admin role assigned to user with UID: ${uid}`);
  } catch (error) {
    console.error('Error assigning admin role:', error);
    throw error;
  }
}
