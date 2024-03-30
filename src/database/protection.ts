import CONST from '@src/CONST';
import type {Database} from 'firebase/database';
import {getUniqueId} from 'react-native-device-info';
import DBPATHS from './DBPATHS';
import {readDataOnce} from './baseFunctions';
import type {AccountCreations} from '@src/types/database';

/** Check that the current device has not created too many accounts
 * in the last 24 hours. If the limit is exceeded, an error is thrown.
 */
async function checkAccountCreationLimit(db: Database): Promise<void> {
  const deviceId = await getUniqueId(); // Use a device identifier
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const limit = CONST.ACCOUNT_CREATION_LIMIT;

  const deviceRef = DBPATHS.ACCOUNT_CREATIONS_DEVICE_ID.getRoute(deviceId);
  const deviceData: AccountCreations | null = await readDataOnce(db, deviceRef);
  if (!deviceData) {return;}

  const recentAccountCreations = Object.values(deviceData).filter(
    timestamp => timestamp >= oneDayAgo,
  );

  if (recentAccountCreations.length >= limit) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return;
}

export {checkAccountCreationLimit};
