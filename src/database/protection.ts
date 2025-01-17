import CONST from '@src/CONST';
import type {Database} from 'firebase/database';
import {getUniqueId} from 'react-native-device-info';
import type {AccountCreations} from '@src/types/onyx';
import DBPATHS from '@src/DBPATHS';
import {readDataOnce} from './baseFunctions';

/** Check that the current device has not created too many accounts
 * in the last 24 hours. If the limit is exceeded, return false.
 */
async function checkAccountCreationLimit(db: Database): Promise<boolean> {
  const deviceId = await getUniqueId(); // Use a device identifier
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const limit = CONST.ACCOUNT_CREATION_LIMIT;

  const deviceRef = DBPATHS.ACCOUNT_CREATIONS_DEVICE_ID.getRoute(deviceId);
  const deviceData: AccountCreations | null =
    await readDataOnce<AccountCreations>(db, deviceRef);
  if (!deviceData) {
    return true;
  }

  const recentAccountCreations = Object.values(deviceData).filter(
    timestamp => timestamp >= oneDayAgo,
  );

  if (recentAccountCreations.length >= limit) {
    return false;
  }

  return true;
}

export {
  // eslint-disable-next-line import/prefer-default-export
  checkAccountCreationLimit,
};
