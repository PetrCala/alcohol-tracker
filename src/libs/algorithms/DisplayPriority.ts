import {UserPriority, UserPriorityList} from '@src/types/various/Algorithms';
import {UserStatus, UserStatusList} from '@src/types/onyx';
import {sumAllDrinks} from '@libs/DataHandling';
import {sessionIsExpired} from '@libs/SessionUtils';
import _, {get} from 'lodash';

/**
 * Based on the user status data, calculate the display priority of the users.
 * Return the user IDs in the order they should be displayed.
 *
 * @param userIds Array of user IDs to calculate the display priority for.
 * @param usersPriority Object containing the display priority of each user.
 */
function orderUsersByPriority(
  userIds: string[],
  usersPriority: UserPriorityList,
): string[] {
  return userIds.sort((a, b) => usersPriority[b] - usersPriority[a]);
}

function calculateAllUsersPriority(
  userIds: string[],
  userStatusList: UserStatusList,
): UserPriorityList {
  let usersPriority: UserPriorityList = {};
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

function calculateUserPriority(userStatusData: UserStatus): number {
  const latestSession = userStatusData.latest_session;
  const latestSessionTime = get(latestSession, 'start_time', null);
  const timeSinceLastSession = latestSessionTime
    ? new Date().getTime() - latestSessionTime
    : 1e15;
  const expired = sessionIsExpired(latestSession);
  // The older the last session, the lower the priority
  const timeCoefficient = Math.log(timeSinceLastSession) * 50 * -1;
  if (expired) return timeCoefficient; // Do not account for session if expired

  const sessionActive = latestSession?.ongoing ? 1 : 0;
  const sessionDrinks = latestSession?.drinks
    ? sumAllDrinks(latestSession.drinks) // TODO units should be used here perhaps
    : 0;
  return (
    sessionActive * 500 +
    sessionDrinks * sessionActive * 10 + // Only count active sessions
    timeCoefficient
  );
}

export {calculateAllUsersPriority, calculateUserPriority, orderUsersByPriority};
