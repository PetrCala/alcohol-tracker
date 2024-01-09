import { BetaKeysData } from "@database/beta";

/** Validate that a beta key is available for use in the database.
 * If it is, return the database id of that key.
 * If it is not, return null.
 */
export function validateBetaKey(betaKeys: BetaKeysData, betaKey:string): string | null{
    for (const [id, value] of Object.entries(betaKeys)) {
        if (value.key === betaKey) {
            if (value.in_usage) {
                return null; // In usage
            } else {
                return id; // Integer id associated with the key object in database
            }
        };
    };
    return null;  // Key not found in database
};
