import type {Timestamp, UserID} from './OnyxCommon';

/** A device unique identifier */
type DeviceId = string;

/** A list of account creations, mapping ID of each user to a timestamp when their account was created */
type AccountCreations = Record<UserID, Timestamp>;

/** A list of account creations for a single device */
type AccountCreationsList = Record<DeviceId, AccountCreations>;

export default AccountCreations;
export type {AccountCreationsList, DeviceId};
