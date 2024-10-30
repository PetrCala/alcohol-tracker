import {Auth, UserRecord} from 'firebase-admin/lib/auth';
import {Database} from 'firebase-admin/lib/database/database';
import admin from './admin';
import {IdToDisplayName} from './adminTypes';

/**
 * Get the auth object for the admin user. Targets the environment as specified
 * in the .env file.
 *
 * @returns The admin auth object.
 */
async function getAdminAuth(): Promise<Auth> {
  return admin.auth();
}

/**
 * Get the database object for the admin user. Targets the environment as specified
 * in the .env file.
 *
 * @returns The admin database object.
 */
async function getAdminDb(): Promise<Database> {
  return admin.database();
}

/** Using an admin auth, fetch data for all users in the
 * Firebase authentication. Return these as an array of 'UserRecord's.
 *
 * @param adminAuth The admin auth object.
 */
async function fetchAllDbUsers(adminAuth?: Auth): Promise<UserRecord[]> {
  let allUsers: UserRecord[] = [];
  let nextPageToken;
  do {
    const auth = adminAuth ?? (await getAdminAuth());
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    allUsers = allUsers.concat(listUsersResult.users);
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
  return allUsers;
}

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
async function listAllAdmins(): Promise<UserRecord[]> {
  const admins: UserRecord[] = [];
  let allUsers = await fetchAllDbUsers();
  allUsers.forEach((userRecord: UserRecord) => {
    const customClaims = userRecord.customClaims || {};
    if (customClaims.admin) {
      admins.push(userRecord);
    }
  });

  return admins;
}

/**
 * Assigns the admin role to a specified user by UID.
 *
 * @param uid User ID of the user to be assigned the admin role.
 * @returns Promise indicating the operation's completion.
 */
async function assignAdminRole(uid: string): Promise<void> {
  try {
    const adminAuth = await getAdminAuth();
    await adminAuth.setCustomUserClaims(uid, {admin: true});
    console.log(`Admin role assigned to user with UID: ${uid}`);
  } catch (error) {
    console.error('Error assigning admin role:', error);
    throw error;
  }
}

async function getDisplayName(
  uid: string,
  adminAuth?: Auth,
): Promise<string | undefined> {
  const auth = adminAuth ?? (await getAdminAuth());
  const userRecord = await auth.getUser(uid);
  return userRecord.displayName;
}

/**
 * Using an admin database, fetch an email of a user by their user ID.
 */
async function getUserEmail(
  uid: string,
  adminAuth?: Auth,
): Promise<string | undefined> {
  const auth = adminAuth ?? (await getAdminAuth());
  const userRecord = await auth.getUser(uid);
  return userRecord.email;
}

/**
 * Using an admin database, fetch all user IDs in the database.
 *
 * @param adminAuth The admin auth object.
 * @returns {Promise<string[]>} List of all user IDs.
 */
async function getAllUserIds(adminAuth?: Auth): Promise<string[]> {
  const allUsers = await fetchAllDbUsers(adminAuth);
  return allUsers.map((userRecord: UserRecord) => userRecord.uid);
}

// async function getAllUserEmails(adminAuth?: Auth): Promise<EmailList> {
//   const allUsers = await fetchAllDbUsers(adminAuth)
//   return allUsers.map((userRecord: UserRecord) => userRecord.email)
// }

async function fetchUserDisplayNames(
  adminAuth?: Auth,
): Promise<IdToDisplayName> {
  const IdToDisplayName: IdToDisplayName = {};
  const allUsers = await fetchAllDbUsers(adminAuth);
  allUsers.forEach((userRecord: UserRecord) => {
    IdToDisplayName[userRecord.uid] = userRecord.displayName;
  });
  return IdToDisplayName;
}

export {
  getAdminAuth,
  getAdminDb,
  fetchAllDbUsers,
  listAllAdmins,
  assignAdminRole,
  getAllUserIds,
  // getAllUserEmails,
  getDisplayName,
  getUserEmail,
  fetchUserDisplayNames,
};
