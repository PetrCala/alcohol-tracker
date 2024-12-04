import type {UserID} from './OnyxCommon';

/**
 *
 */
type DeviceId = string;

/**
 *
 */
type AccountCreations = Record<UserID, number>; // timestamp

/**
 *
 */
type AccountCreationsList = Record<DeviceId, AccountCreations>;

export default AccountCreations;
export type {AccountCreationsList, DeviceId};
