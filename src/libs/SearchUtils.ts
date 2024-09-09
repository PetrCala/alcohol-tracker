import type {UserIDToNicknameMapping} from '@src/types/various/Search';

/**
 * Input an object where the keys are userIDs, and the first level
 * of the object contains the display name of the user
 *
 * @param object - The input object containing user data
 * @param displayNameKey - The key to access the display name of the user, defaults to "display_name"
 * @returns A mapping of user ids to nicknames
 */
function getNicknameMapping(
  object: Record<string, Record<string, string> & Record<string, any>>,
  displayNameKey = 'display_name',
): UserIDToNicknameMapping {
  const mapping: UserIDToNicknameMapping = {};

  for (const userID in object) {
    const user = object[userID];
    const nickname = user[displayNameKey];
    mapping[userID] = nickname;
  }

  return mapping;
}

export {getNicknameMapping};
