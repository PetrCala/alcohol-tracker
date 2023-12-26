// Run this script with an argument using
// # ts-node _dev/database/userUtils.tsx [argument]

import admin from '../utils/admin';
import { deleteUserInfo } from '../../src/database/users';

const adminDb = admin.database();

async function wipeUserData(userId:string) {
    console.log(`Wiping user data for user with ID: ${userId}`);
    // TODO
};

async function main(){
    const argument = process.argv[2];
    wipeUserData(argument);
}

main()