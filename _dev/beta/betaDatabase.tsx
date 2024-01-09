import { BetaKeysData } from "@database/beta";

/** Using an array of keys, write these keys into the database,
 * creating a new object for every key of that array.
 * 
 * Index keys from 1 up to the length of the array, and replace
 * any existing data in the databse.
 * 
 * @note Meant as a one-off function only
 */
export async function writeBetaKeysIntoDatabase(db:any, keys: string[]){
    try {
        for (let i = 0; i < keys.length; i++){
            let newKeyRef = `beta_keys/${i+1}`;
            let newKeyData = {
                key: keys[i],
                in_usage: false,
            };
            await db.ref(newKeyRef).set(newKeyData);
        }
    } catch (error:any) {
        throw new Error("Failed to retrieve the beta keys: " + error.message);
    };
};

/** Fetch the beta keys data from the database as a one-off event
 * 
 * @param db Database object
 * @returns Beta keys data
 */
export async function getDatabaseBetaKeys(db:any): Promise<BetaKeysData | null>{
    let betaKeysRef = `beta_keys/`
    try {
        const snapshot = await db.ref(betaKeysRef).once('value');
        if (snapshot.exists()) {
          const data: BetaKeysData = snapshot.val();
          return data;
        }
        return null;
    } catch (error:any) {
        throw new Error("Failed to retrieve the beta keys: " + error.message);
    };
};

