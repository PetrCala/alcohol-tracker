// Run this script with an argument using
// # bun _dev/database/userUtils.tsx [argument]

import { assignAdminRole, listAllAdmins } from "./adminUtils";
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

async function main(){
    const argument = process.argv[2];
    wipeUserData(argument);
}

main()