import {DatabaseProps} from '../../../../src/types/database';
import {cleanStringForFirebaseKey} from '../../../../src/utils/strings';

/**
 * Using the admin database, add all profile display_name nicknames
 * to the nickname_to_id table in the database
 */
export const updateAllNicknameToIdData = (
  dbToUpdate: DatabaseProps,
): DatabaseProps => {
  console.log('Converting nicknames to IDs and saving to database...');
  const allUserIds = Object.keys(dbToUpdate.users);
  for (let i = 0; i < allUserIds.length; i++) {
    let verboseIdx = i + 1;
    console.log('Processing ' + verboseIdx + '/' + allUserIds.length);
    let userId = allUserIds[i];
    let nickname = dbToUpdate.users[userId].profile.display_name;
    let nicknameKey = cleanStringForFirebaseKey(nickname);
    // TODO fix here
    dbToUpdate.nickname_to_id[nicknameKey][userId] = nickname;
  }
  console.log('All nicknames converted and saved successfully');
  return dbToUpdate;
};

export default updateAllNicknameToIdData;
