import { invalidChars } from "./static";

/**
 * Clean a string to be used as a key for the Firebase Realtime Database.
 * 
 * The function will:
 * 1.Replace any sequence of characters in the 'invalidChars' array or whitespace with a single underscore.
 * 2. Remove any white space from the string.
 * 
 * This ensures that for any given input string, the cleaned result is consistent,
 * enabling it to be reliably used as a key in the database.
 * 
 * @param {string} rawStr - The raw input string to be cleaned.
 * @returns {string} - The cleaned string.
 * 
 * @example
 * const rawNickname = "John.Doe #1";
 * const key = cleanStringForFirebaseKey(rawNickname);
 * console.log(key);  // Outputs: "John_Doe_1"
 */
export function cleanStringForFirebaseKey(rawStr: string): string {
    // List of invalid characters.

    // First replace invalid characters with an underscore.
    let intermediateStr = rawStr.split('').map(char => 
        invalidChars.includes(char) ? '_' : char
    ).join('');

    // Now, replace any sequence of underscores and/or whitespaces with a single underscore.
    const cleanedStr = intermediateStr.replace(/[_\s]+/g, '_');

    return cleanedStr;
}