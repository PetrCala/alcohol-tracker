import fs from 'fs';
import { DatabaseProps, NicknameToIdData, UserData } from "../../../../src/types/database";
import { modifyAndTestData } from "../../migrationTest";
import { getAllUserIds } from "../../../utils/various";
import { cleanStringForFirebaseKey } from "../../../../src/utils/strings";
import { getDatabase } from '_dev/database/databaseUtils';
import { findSingleValueByKey } from '../../../../src/utils/utils';


export const addUserNicknameToId = (db: DatabaseProps, userId: string): DatabaseProps => {
    try {
        const user:UserData = findSingleValueByKey(db.users, userId);
        if (user) {
            const nickname = user.profile.display_name;
            if (!nickname) throw new Error("No nickname found for user: " + userId);
            const nicknameKey = cleanStringForFirebaseKey(nickname);
            console.log("Adding nickname: " + nickname + " to nickname_to_id table")
            console.log("Nickname key: " + nicknameKey)
            db.nickname_to_id[nicknameKey][userId] = nickname;
            return db;
        } else {
            throw new Error("Could not find data for user: " + userId);
        }
    } catch (error) {
        throw new Error(`Error processing user ${userId}: ${error}`);
    }
};

// export const addUserNicknameToIdData = async (db:any, userId: string):Promise<boolean> => {
//     try {
//         const profileRef = `users/${userId}/profile/`;
//         const snapshot = await db.ref(profileRef).once('value');
//         const data = snapshot.val();
//         if (data) {
//             const nickname = data.display_name;
//             if (!nickname) return false;
//             const nicknameKey = cleanStringForFirebaseKey(nickname);
//             const nicknameRef = `nickname_to_id/${nicknameKey}/${userId}`
//             await db.ref(nicknameRef).set(nickname);
//             return true
//         } else {
//             console.log("Could not find data for user: " + userId);
//             return false;
//         }
//     } catch (error) {
//         console.error(`Error processing user ${userId}:`, error);
//         return false;
//     }
// };

/**
 * Using the admin database, add all profile display_name nicknames
 * to the nickname_to_id table in the database
 */
// export const updateAllNicknameToIdData = async (adminDb: any) => {
//     const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";

//     const testResult = await addUserNicknameToIdData(adminDb, testUserId);

//     if (testResult !== true) {
//         throw new Error("Refactorization test failed.");
//     }

//     console.log("Converting nicknames to IDs and saving to database...")
//     const allUserIds = await getAllUserIds(adminDb);
//     for (let i = 0; i < allUserIds.length; i++) {
//         let verboseIdx = i + 1;
//         console.log("Processing "+ verboseIdx + "/" + allUserIds.length)
//         let userId = allUserIds[i];
//         await addUserNicknameToIdData(adminDb, userId);
//     }
//     console.log("All nicknames converted and saved successfully")
// };

// export default updateAllNicknameToIdData;