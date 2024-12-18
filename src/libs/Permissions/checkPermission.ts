// SinglePermissionHandler.js
import {check, checkNotifications} from 'react-native-permissions';
import type {Permission} from 'react-native-permissions';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import {permissionIsGranted} from './PermissionsUtils';
import permissionsMap from './PermissionsMap';
import type {PermissionKey} from './types';

const getPermission = (permissionType: PermissionKey) => {
  return permissionsMap[permissionType][getPlatform()];
};

const checkGeneralPermission = async (
  permissionType: PermissionKey,
): Promise<boolean> => {
  const value = getPermission(permissionType);
  if (!value) {
    return false;
  }
  const status = await check(value as Permission);
  return permissionIsGranted(status);
};

const checkNotificationPermission = async (): Promise<boolean> => {
  const {status} = await checkNotifications();
  return permissionIsGranted(status);
};

/**
 * Checks the permission for the specified permission type.
 * @param permissionType - The type of permission to check.
 * @returns A promise that resolves to a boolean indicating whether the permission is granted or not.
 */
const checkPermission = async (
  permissionType: PermissionKey,
): Promise<boolean> => {
  let result: boolean;
  if (
    permissionType === 'notifications' &&
    getPlatform() === CONST.PLATFORM.IOS
  ) {
    result = await checkNotificationPermission();
  } else {
    result = await checkGeneralPermission(permissionType);
  }
  return result;
};

export default checkPermission;
