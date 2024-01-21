import CONST from '@src/CONST';

/**
 * Clean a string to be used as a key for the Firebase Realtime Database.
 *
 * The function will:
 * 1.Replace any sequence of characters in the 'invalidChars' array or whitespace with a single underscore.
 * 2. Remove any white space from the string.
 * 3. Remove any diacritics.
 * 3. If the string is empty, an underscore will be returned
 *
 * This ensures that for any given input string, the cleaned result is consistent,
 * enabling it to be reliably used as a key in the database.
 *
 * @param {string} rawStr - The raw input string to be cleaned.
 * @returns {string} - The cleaned string.
 *
 * @example
 * const rawNickname = "John.Doe #1 č ";
 * const key = cleanStringForFirebaseKey(rawNickname);
 * console.log(key);  // Outputs: "john_doe_1_c"
 */
export function cleanStringForFirebaseKey(rawStr: string): string {
  // Trim spaces and normalize the string to its canonical decomposed form.
  const normalizedStr = rawStr.trim().normalize('NFD');

  // Remove diacritical marks and replace invalid characters or whitespace with an underscore.
  const intermediateStr = normalizedStr
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '_') // No dashes
    .split('')
    .map(char =>
      CONST.INVALID_CHARS.includes(char as any) || char.trim() === '' ? '_' : char,
    )
    .join('');

  // Replace any sequence of underscores and/or whitespaces with a single underscore and convert to lowercase.
  const cleanedStr = intermediateStr.replace(/[_\s]+/g, '_').toLowerCase();

  // If the cleaned string is empty or just "_", return "_". Otherwise, remove trailing underscores.
  return cleanedStr === '' || cleanedStr === '_'
    ? '_'
    : cleanedStr.replace(/_+$/, '');
}
