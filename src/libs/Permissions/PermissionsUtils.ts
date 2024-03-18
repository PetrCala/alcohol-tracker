import {PermissionsAndroid} from 'react-native';
import {RESULTS} from 'react-native-permissions';

export type PermissionKey =
  | 'camera'
  | 'notifications'
  | 'read_photos'
  | 'write_photos';

export type PermissionEntry = {[key: string]: any};

export const permissionIsGranted = (status: any) => {
  return [
    PermissionsAndroid.RESULTS.GRANTED,
    RESULTS.GRANTED,
    RESULTS.LIMITED,
  ].includes(status);
};

export const permissionIsDenied = (status: any) => {
  return [
    PermissionsAndroid.RESULTS.DENIED,
    PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
    RESULTS.DENIED,
    RESULTS.BLOCKED,
    RESULTS.UNAVAILABLE,
  ].includes(status);
};
