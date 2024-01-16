// Run this script with an argument using
// # bun _dev/database/userUtils.tsx [argument]

import { assignAdminRole, listAllAdmins } from "../database/adminUtils";
import { deleteUserInfo } from '../../src/database/users';

//   await listAllAdmins().then(admins => {
//     admins.forEach((admin: UserRecord) => {
//         console.log(`UID: ${admin.uid}, Email: ${admin.email}`);
//     });
// });

async function wipeUserData(userId:string) {
    console.log(`Wiping user data for user with ID: ${userId}`);
    // TODO
};

/**
 * Using an admin database, fetch all user IDs in the database.
 * 
 * @param {any} adminDb The admin database.
 * @returns {Promise<string[]>} List of all user IDs.
 */
export async function getAllUserIds(adminDb:any):Promise<string[]> {
    var userIds = [];
    const snapshot = await adminDb.ref('users/').once('value');
    const data = snapshot.val();
    if (data) {
        for (let userId in data) {
            userIds.push(userId);
        };
    }
    return userIds;
};

async function main(){
    const argument = process.argv[2];
    wipeUserData(argument);
}

main()