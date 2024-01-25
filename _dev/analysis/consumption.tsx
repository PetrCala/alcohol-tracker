import {getSingleMonthDrinkingSessions} from '../../src/utils/dataHandling';
import {DatabaseProps, DrinkingSessionData} from '../../src/types/database';
import {getDatabase} from '../database/databaseUtils';

export const getUserOverallConsumption = (db: DatabaseProps): void => {
  const allUserIds = Object.keys(db.users);
  let totalSessionCount = 0;
  let activeUsers = 0;
  let inactiveUsers = 0;
  for (let i = 0; i < allUserIds.length; i++) {
    let verboseIdx = i + 1;
    let userId = allUserIds[i];
    let userData = db.users[userId];
    let userPreferences = db.user_preferences[userId];
    let userDrinkingSessions: DrinkingSessionData =
      db.user_drinking_sessions[userId];
    console.log(
      'Processing ' +
        verboseIdx +
        '/' +
        allUserIds.length +
        ' - Anonymous user' +
        verboseIdx,
    );
    try {
      totalSessionCount = 0;
      let singleMonthSessionsarray = getSingleMonthDrinkingSessions(
        new Date(),
        Object.values(userDrinkingSessions),
      );
      singleMonthSessionsarray.forEach(session => {
        totalSessionCount += 1;
      });
      if (totalSessionCount > 0) {
        activeUsers += 1;
      } else {
        inactiveUsers += 1;
      }

      // let sessionsTotal = Object.values(userDrinkingSessions).reduce(
      //   (acc, session) => {
      //     return acc + 1;
      //   },
      //   0,
      // );
      // totalSessionCount += sessionsTotal;
      console.log(totalSessionCount);
    } catch (error) {
      console.log('This user has no sessions');
    }
  }
  console.log('Total session count: ' + totalSessionCount);
  console.log('Total user count: ' + allUserIds.length);
  console.log('Active user count: ' + activeUsers);
  console.log('Inactive user count: ' + inactiveUsers);
  console.log(
    'Active user percentage: ' +
      ((activeUsers / allUserIds.length) * 100).toFixed(2) +
      '%',
  );
  console.log(
    'Average sessions per user: ' +
      (totalSessionCount / allUserIds.length).toFixed(2),
  );
};

const db = getDatabase('production');
if (!db) throw new Error('Could not get database');
getUserOverallConsumption(db);
process.exit(0);
