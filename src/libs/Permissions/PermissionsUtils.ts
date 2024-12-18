import {PermissionsAndroid} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import type {GeneralPermissionStatus} from './types';

const permissionIsGranted = (status: GeneralPermissionStatus) => {
  const allowedStatuses = [
    PermissionsAndroid.RESULTS.GRANTED,
    RESULTS.GRANTED,
    RESULTS.LIMITED,
  ];

  return allowedStatuses.some(allowedStatus => allowedStatus === status);
};

const permissionIsDenied = (status: GeneralPermissionStatus) => {
  const deniedStatuses = [
    PermissionsAndroid.RESULTS.DENIED,
    PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
    RESULTS.DENIED,
    RESULTS.BLOCKED,
    RESULTS.UNAVAILABLE,
  ];

  return deniedStatuses.some(deniedStatus => deniedStatus === status);
};

const AndroidFilePermissions = [
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
];

export {permissionIsGranted, permissionIsDenied, AndroidFilePermissions};
