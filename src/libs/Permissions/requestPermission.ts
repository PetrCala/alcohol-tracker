import {
  Alert,
  Platform,
  PermissionsAndroid,
  Permission,
  Rationale,
  Linking,
  PermissionStatus,
} from 'react-native';
import {
  request,
  RESULTS,
  Permission as RNPermission,
  PermissionStatus as RNPermissionStatus,
  requestNotifications,
  NotificationsResponse,
} from 'react-native-permissions';
import {
  AndroidFilePermissions,
  PermissionKey,
  permissionIsDenied,
  permissionIsGranted,
} from './PermissionsUtils';
import permissionsMap from './PermissionsMap';
import permissionsMessages from './PermissionsMessages';

const openSettings = () => {
  Linking.openSettings();
};

/**
 * Android permission check to store/read images
 */
async function hasAndroidFilePermission(): Promise<boolean> {
  // On Android API Level 33 and above, these permissions do nothing and always return 'never_ask_again'
  // More info here: https://stackoverflow.com/a/74296799
  if (Number(Platform.Version) >= 33) {
    return Promise.resolve(true);
  }

  // Read and write permission
  const writePromise = PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  const readPromise = PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );

  return Promise.all([writePromise, readPromise]).then(
    ([hasWritePermission, hasReadPermission]) => {
      if (hasWritePermission && hasReadPermission) {
        return true; // Return true if permission is already given
      }

      // Ask for permission if not given
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then(
        status =>
          status['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
          status['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted',
      );
    },
  );
}

const requestPermissionAndroid = async (
  permission: Permission,
  permissionType: PermissionKey,
): Promise<PermissionStatus> => {
  try {
    // Handle android file permissions separately
    if (AndroidFilePermissions.includes(permission)) {
      const hasPermission = await hasAndroidFilePermission();
      if (hasPermission) {
        return PermissionsAndroid.RESULTS.GRANTED;
      }
      return PermissionsAndroid.RESULTS.DENIED;
    }
    const rationale: Rationale = {
      title: permissionsMessages[permissionType].title,
      message: permissionsMessages[permissionType].message,
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    };
    // const status = await PermissionsAndroid.request(permission, rationale);
    const status = await PermissionsAndroid.request(permission, rationale);
    return status; // status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err: any) {
    // console.warn(err);
    return PermissionsAndroid.RESULTS.DENIED;
  }
};

const requestPermissionIOS = async (
  permission: RNPermission,
): Promise<RNPermissionStatus> => {
  const status = await request(permission);
  return status; // status === RESULTS.GRANTED;
};

const requestNotificationsPermissionIOS =
  async (): Promise<NotificationsResponse> => {
    const response = await requestNotifications(['alert', 'sound']);
    return response; // response.status === RESULTS.GRANTED;
  };

/**
 * Requests a specific permission.
 * @param permissionType - The type of permission to request.
 * @returns A promise that resolves to a boolean indicating whether the permission was granted.
 */
export const requestPermission = async (permissionType: PermissionKey) => {
  const permission: Permission | RNPermission =
    permissionsMap[permissionType][Platform.OS];

  let status: any;
  if (Platform.OS === 'android') {
    status = await requestPermissionAndroid(
      permission as Permission,
      permissionType,
    );
  } else if (Platform.OS === 'ios' && permissionType === 'notifications') {
    status = await requestNotificationsPermissionIOS();
  } else if (Platform.OS === 'ios') {
    status = await requestPermissionIOS(permission as RNPermission);
  }

  const isGranted = permissionIsGranted(status);

  if (!isGranted) {
    const restrictedAccess = permissionIsDenied(status);
    if (restrictedAccess) {
      Alert.alert(
        'Storage Permission Required',
        'App needs access to your storage to read files. Please go to app settings and grant permission.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: openSettings},
        ],
      );
    } else {
      Alert.alert(
        'Permission Denied',
        'You need to grant permission for this functionality to work.',
      );
    }
  }

  return isGranted;
};
