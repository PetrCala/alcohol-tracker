import { Alert } from "react-native";
import { ref } from "firebase/database";
import adminDb from "../database/adminDatabase";
import { readDataOnce } from "../database/baseFunctions";

type BetaKeysData = {
    [beta_key: string]: {
        in_usage: boolean;
        user_id?: string;
    },
};

/** Generate a single, possibly non-unique beta key
 * 
 * @param length Length of the beta key
 * @returns String, the beta key
 */
function generateBetaKey(length:number = 50): string{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    
    return result;
};

/** Generate an array of beta keys
 * 
 * @param length Length of the beta keys array
 * @returns An array of beta keys
 */
function generateBetaKeys(length:number = 90): string[] {
    let betaKeys:string[] = [];
    
    for (let i=0; i < length; i++) {
        let newKey = generateBetaKey()
        while (betaKeys.includes(newKey)){
            newKey = generateBetaKey(); // Regenerate the key
        };
        betaKeys.push(newKey);
    }

    return betaKeys;
};

async function getDatabaseBetaKeys(db:any){

    let betaKeysRef = `beta_keys/`
    let betaKeys:BetaKeysData = {};
    try {
        let data:BetaKeysData = await readDataOnce(db, betaKeysRef);
        if (data){
            betaKeys = data;
        }
    } catch (error:any){
        Alert.alert("Beta key data fetch unsuccessful", "Failed to fetch the beta key data: " + error.message);
    };
    return betaKeys;
}

