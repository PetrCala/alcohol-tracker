// SinglePermissionHandler.js
import React, {useState, useEffect} from 'react';
import {
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  View,
  Text,
  Image,
  ImageSourcePropType,
  Permission,
  Rationale,
  Linking,
} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission as RNPermission,
  requestNotifications,
  checkNotifications,
} from 'react-native-permissions';
import {PermissionKey} from './PermissionsUtils';
import {permissionsMap} from './PermissionsList';
import {permissionsMessages} from './PermissionsMessages';

type PermissionHandlerProps = {
  permissionType: PermissionKey;
  imageSource: ImageSourcePropType;
  imageStyle: any;
  children: any;
};

/**
 * PermissionHandler component handles the permission logic for a specific permission type.
 *
 * @component
 * @param props - The component props.
 * @param props.permissionType - The type of permission to handle.
 * @param props.imageSource - Source of the object to render.
 * @param props.imageStyle - Style of the object to render.
 * @param props.children - The child components to render if permission is granted.
 * @returns The rendered component based on the permission status.
 */
const PermissionHandler: React.FC<PermissionHandlerProps> = ({
  permissionType,
  imageSource,
  imageStyle,
  children,
}) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (permissionType === 'notifications' && Platform.OS === 'ios') {
      checkNotificationPermission();
    } else {
      checkPermission();
    }
  }, [permissionType]);

  // Perhaps employ checkMultiple, requestMultiple,...

  const getPermission = () => {
    return permissionsMap[permissionType][Platform.OS];
  };

  const checkPermission = async () => {
    const status = await check(getPermission());
    handlePermissionStatus(status);
  };

  const checkNotificationPermission = async () => {
    const {status} = await checkNotifications();
    handlePermissionStatus(status);
  };

  const handlePermissionStatus = (status: string) => {
    if (status === RESULTS.GRANTED) {
      setPermissionGranted(true);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const requestPermissionAndroid = async (permission: Permission) => {
    try {
      const rationale: Rationale = {
        title: permissionsMessages[permissionType].title,
        message: permissionsMessages[permissionType].message,
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      };
      const granted = await PermissionsAndroid.request(permission, rationale);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err: any) {
      // console.warn(err);
      return false;
    }
  };

  const requestPermissionIOS = async (permission: RNPermission) => {
    const status = await request(permission);
    return status === RESULTS.GRANTED;
  };

  const requestNotificationsPermissionIOS = async () => {
    const response = await requestNotifications(['alert', 'sound']);
    return response.status === RESULTS.GRANTED;
  };

  const requestPermission = async () => {
    const permission: Permission | RNPermission =
      permissionsMap[permissionType][Platform.OS];

    let isGranted = false;
    if (Platform.OS === 'android') {
      isGranted = await requestPermissionAndroid(permission as Permission);
    } else if (Platform.OS === 'ios' && permissionType === 'notifications') {
      isGranted = await requestNotificationsPermissionIOS();
    } else if (Platform.OS === 'ios') {
      isGranted = await requestPermissionIOS(permission as RNPermission);
    }

    if (!isGranted) {
      Alert.alert(
        'Permission Denied',
        'You need to grant permission for this functionality to work.',
      );
    }

    // How to handle never ask again on permission result
    // if (result === (PermissionsAndroid).RESULTS.NEVER_ASK_AGAIN)
    // Alert.alert(
    //   'Storage Permission Required',
    //   'App needs access to your storage to read files. Please go to app settings and grant permission.',
    //   [
    //     {text: 'Cancel', style: 'cancel'},
    //     {text: 'Open Settings', onPress: openSettings},
    //   ],
    // );

    return isGranted;
  };

  return (
    <>
      {permissionGranted ? (
        children
      ) : (
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}>
          <Image source={imageSource} style={imageStyle} />
        </TouchableOpacity>
      )}
    </>
  );
};

export default PermissionHandler;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  permissionButton: {
    alignSelf: 'center',
    flex: 1,
    // backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});
