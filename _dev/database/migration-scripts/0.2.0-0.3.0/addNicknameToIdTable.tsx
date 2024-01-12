import { DatabaseProps, NicknameToIdData, UserData } from "../../../../src/types/database";
import { getAllUserIds } from "../../../utils/various";
import { cleanStringForFirebaseKey } from "../../../../src/utils/strings";
import { findSingleValueByKey } from '../../../../src/utils/utils';

export const getNickname = (db: DatabaseProps, userId: string): string => {
    try {
        const user:UserData = findSingleValueByKey(db.users, userId);
        if (user) {
            const nickname = user.profile.display_name;
            if (!nickname) throw new Error("No nickname found for user: " + userId);
            return nickname;
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
export const updateAllNicknameToIdData = (dbToUpdate: DatabaseProps, adminDb: any): DatabaseProps => {
    console.log("Converting nicknames to IDs and saving to database...")
    const allUserIds = Object.keys(dbToUpdate.users);
    for (let i = 0; i < allUserIds.length; i++) {
        let verboseIdx = i + 1;
        console.log("Processing "+ verboseIdx + "/" + allUserIds.length)
        let userId = allUserIds[i];
        let nickname = getNickname(dbToUpdate, userId);
        let nicknameKey = cleanStringForFirebaseKey(nickname);
        // TODO fix here
        dbToUpdate.nickname_to_id[nicknameKey][userId] = nickname;
    }
    console.log("All nicknames converted and saved successfully")
    return dbToUpdate;
};

export default updateAllNicknameToIdData;