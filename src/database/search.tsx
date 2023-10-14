import { Database, ref, get, push, child, set, update } from "firebase/database";
import { FriendRequestData, NicknameToIdData } from "../types/database";
import { Alert } from "react-native";
import { userExistsInDatabase } from "./users";


/**
 * Using a database object and a nickname to search,
 * fetch the user IDs that belong to that nickname.
 * Return this object if it exists, or an empty object
 * if not.
 * 
 * @param {Database} db Firebase Database object.
 * @param {string} nickname The nickname to search for.
 * @returns {Promise<NicknameToIdData|null>} The user IDs
 *  that belong to this nickname
 */
export async function searchDbByNickname(
    db:Database,
    nickname:string
):Promise<NicknameToIdData|null> {
    try {
        const dbRef = ref(db, `nickname_to_id/${nickname}`)
        const snapshot = await get(dbRef);
        if(snapshot.exists()) {
            return snapshot.val(); // The nicknames
        }
        return null;
    } catch (error:any) {
        Alert.alert("Database search failed", "Could not connect to the database. Try again." + error.message)
        return null;
    };
};