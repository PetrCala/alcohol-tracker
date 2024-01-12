import {DatabaseProps, DrinkingSessionData} from '../../src/types/database';
import {getDatabase} from '../database/databaseUtils';

export const getUserOverallConsumption = (db: DatabaseProps): void => {
  const allUserIds = Object.keys(db.users);
  let totalSessionCount = 0;
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
      let sessionsTotal = Object.values(userDrinkingSessions).reduce(
        (acc, session) => {
          return acc + 1;
        },
        0,
      );
      totalSessionCount += sessionsTotal;
      console.log(sessionsTotal);
    } catch (error) {
      console.log('This user has no sessions');
    }
  }
  console.log('Total session count: ' + totalSessionCount);
  console.log('Total user count: ' + allUserIds.length);
  console.log(
    'Average sessions per user: ' +
      (totalSessionCount / allUserIds.length).toFixed(2),
  );
};

const db = getDatabase('production');
if (!db) throw new Error('Could not get database');
console.log(getUserOverallConsumption(db));
process.exit(0);
