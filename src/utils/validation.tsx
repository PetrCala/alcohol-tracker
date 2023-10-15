import { invalidChars } from "./static";

/**
 * Validate that a string does not contain any characters not accepted
 * as keys by the Realtime Firebase.
 * 
 * @param {string} input Input string to check.
 * @returns {boolean} True if the string is valid, false otherwise.
 */
export function isValidString(input:string) {
for(let char of invalidChars) {
    if(input.includes(char)) {
        return false;
    }
}
return true;
}
