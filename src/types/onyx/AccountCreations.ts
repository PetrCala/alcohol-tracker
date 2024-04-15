import type {UserId} from './DatabaseCommon';

type DeviceId = string;

type AccountCreations = Record<UserId, number>; // timestamp

type AccountCreationsList = Record<DeviceId, AccountCreations>;

export default AccountCreations;
export type {AccountCreationsList, DeviceId};
