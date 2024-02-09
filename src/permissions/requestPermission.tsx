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
  PermissionKey,
  permissionIsDenied,
  permissionIsGranted,
} from './PermissionsUtils';
import permissionsMap from './PermissionsList';
import permissionsMessages from './PermissionsMessages';

const openSettings = () => {
  Linking.openSettings();
};

const requestPermissionAndroid = async (
  permission: Permission,
  permissionType: PermissionKey,
): Promise<PermissionStatus> => {
  try {
    const rationale: Rationale = {
      title: permissionsMessages[permissionType].title,
      message: permissionsMessages[permissionType].message,
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    };
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
