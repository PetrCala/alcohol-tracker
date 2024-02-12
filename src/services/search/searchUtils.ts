import {UserIdToNicknameMapping} from '@src/types/various/Search';

/**
 * Input an object where the keys are userIds, and the first level
 * of the object contains the display name of the user
 *
 * @param object - The input object containing user data
 * @param displayNameKey - The key to access the display name of the user, defaults to "display_name"
 * @returns A mapping of user ids to nicknames
 */
export function getNicknameMapping(
  object: {
    [userId: string]: {[displayNameKey: string]: string} & {[key: string]: any};
  },
  displayNameKey: string = 'display_name',
): UserIdToNicknameMapping {
  const mapping: UserIdToNicknameMapping = {};

  for (const userId in object) {
    const user = object[userId];
    const nickname = user[displayNameKey];
    mapping[userId] = nickname;
  }

  return mapping;
}
