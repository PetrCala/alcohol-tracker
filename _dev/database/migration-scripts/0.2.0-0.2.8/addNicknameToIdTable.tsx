import { get } from "lodash";
import { NicknameToIdData } from "../../../../src/types/database";
import { modifyAndTestData } from "../../migrationTest";
import { ref } from "firebase/database";
import { getAllUserIds } from "../../../utils/various";
import { cleanStringForFirebaseKey } from "../../../../src/utils/strings";

export const addUserNicknameToIdData = async (db:any, userId: string):Promise<boolean> => {
    try {
        const profileRef = `users/${userId}/profile/`;
        const snapshot = await db.ref(profileRef).once('value');
        const data = snapshot.val();
        if (data) {
            const nickname = data.display_name;
            if (!nickname) return false;
            const nicknameKey = cleanStringForFirebaseKey(nickname);
            const nicknameRef = `nickname_to_id/${nicknameKey}/${userId}`
            await db.ref(nicknameRef).set(nickname);
            return true
        } else {
            console.log("Could not find data for user: " + userId);
            return false;
        }
    } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        return false;
    }
};

/**
 * Using the admin database, add all profile display_name nicknames
 * to the nickname_to_id table in the database
 */
export const updateAllNicknameToIdData = async (adminDb: any) => {
    const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";

    const testResult = await addUserNicknameToIdData(adminDb, testUserId);

    if (testResult !== true) {
        throw new Error("Refactorization test failed.");
    }

    const allUserIds = await getAllUserIds(adminDb);
    for (let i = 0; i < allUserIds.length; i++) {
        let userId = allUserIds[i];
        await addUserNicknameToIdData(adminDb, userId);
    }
};

export default updateAllNicknameToIdData;