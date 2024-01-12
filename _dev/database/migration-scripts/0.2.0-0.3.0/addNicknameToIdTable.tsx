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
            db.nickname_to_id[nicknameKey][userId] = nickname;
            return db;
        } else {
            throw new Error("Could not find data for user: " + userId);
        }
    } catch (error) {
        throw new Error(`Error processing user ${userId}: ${error}`);
    }
};

/**
 * Using the admin database, add all profile display_name nicknames
 * to the nickname_to_id table in the database
 */
export const updateAllNicknameToIdData = async (adminDb: any) => {
    console.log("Converting nicknames to IDs and saving to database...")
    const allUserIds = await getAllUserIds(adminDb);
    for (let i = 0; i < allUserIds.length; i++) {
        let verboseIdx = i + 1;
        console.log("Processing "+ verboseIdx + "/" + allUserIds.length)
        let userId = allUserIds[i];
        // await addUserNicknameToIdData(adminDb, userId);
    }
    console.log("All nicknames converted and saved successfully")
};

export default updateAllNicknameToIdData;