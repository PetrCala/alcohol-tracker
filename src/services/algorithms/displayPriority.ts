import {UserPriority, UsersPriority} from '@src/types/various/Algorithms';
import {UserStatus, UserStatusList} from '@src/types/database';
import {sumAllUnits} from '@libs/DataHandling';
import {User} from 'firebase/auth';

/**
 * Based on the user status data, calculate the display priority of the users.
 * Return the user IDs in the order they should be displayed.
 *
 * @param userIds Array of user IDs to calculate the display priority for.
 * @param usersPriority Object containing the display priority of each user.
 */
export function orderUsersByPriority(
  userIds: string[],
  usersPriority: UsersPriority,
): string[] {
  return userIds.sort((a, b) => usersPriority[b] - usersPriority[a]);
}

export function calculateAllUsersPriority(
  userIds: string[],
  userStatusList: UserStatusList,
): UsersPriority {
  let usersPriority: UsersPriority = {};
  userIds.forEach(userId => {
    let userPriority: UserPriority = 0;
    let userStatusData: UserStatus = userStatusList[userId];
    if (userStatusData) {
      userPriority = calculateUserPriority(userStatusData);
    }
    usersPriority[userId] = userPriority;
  });
  return usersPriority;
}

export function calculateUserPriority(userStatusData: UserStatus): number {
  let time_since_last_online =
    new Date().getTime() - userStatusData.last_online;
  let session_active = userStatusData.latest_session?.ongoing ? 1 : 0;
  let session_units = userStatusData.latest_session?.units
    ? sumAllUnits(userStatusData.latest_session.units)
    : 0;
  return (
    session_units * 10 +
    session_active * 100 -
    Math.log(time_since_last_online) * 50
  );
}
