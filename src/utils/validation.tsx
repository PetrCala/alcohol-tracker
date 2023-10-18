import { Platform } from "react-native";
import { availablePlatforms, invalidChars } from "./static";

/**
 * Check that the current platform is valid.
 */
export const platformIsValid = ():boolean => {
    return availablePlatforms.includes(Platform.OS);
}

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

/**
 * Check whether an element is a non-empty object.
 * 
 * @description
 * Validate that the object is JSON-like type object with at least one key-value pair.
 * For arrays, return false.
 * 
 * @param {any} input Element/variable to check
 * @returns {boolean} True if the element is a non-empty object, false otherwise.
 */
export function isNonEmptyObject(input:any) {
    try {
        return (input && typeof input === 'object' && !Array.isArray(input) && Object.keys(input).length > 0)
    } catch (error:any) {
        return false;
    };
}
