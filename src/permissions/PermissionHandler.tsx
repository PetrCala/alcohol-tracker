// SinglePermissionHandler.js
import React, {useState, useEffect} from 'react';
import {Button, Alert, Platform} from 'react-native';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  requestNotifications,
  checkNotifications,
} from 'react-native-permissions';
import {PermissionKey, permissionsMap} from './PermissionList';

type PermissionHandlerProps = {
  permissionType: PermissionKey;
  children: any;
};

/**
 * PermissionHandler component handles the permission logic for a specific permission type.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.permissionType - The type of permission to handle.
 * @param {ReactNode} props.children - The child components to render if permission is granted.
 * @returns {ReactNode} - The rendered component based on the permission status.
 */
const PermissionHandler: React.FC<PermissionHandlerProps> = ({
  permissionType,
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
    handlePermissiontatus(status);
  };

  const checkNotificationPermission = async () => {
    const {status} = await checkNotifications();
    handlePermissiontatus(status);
  };

  const handlePermissiontatus = (status: string) => {
    if (status === RESULTS.GRANTED) {
      setPermissionGranted(true);
    }
  };

  const requestPermission = async () => {
    let status: string;
    if (permissionType === 'notifications' && Platform.OS === 'ios') {
      const response = await requestNotifications(['alert', 'sound']);
      status = response.status;
    } else {
      status = await request(getPermission());
    }

    if (status === RESULTS.GRANTED) {
      setPermissionGranted(true);
    } else {
      Alert.alert(
        'Permission Denied',
        'This functionality might not work properly!',
      );
    }
  };

  return (
    <>
      {permissionGranted ? (
        children
      ) : (
        <Button
          title={`Request ${permissionType} permission`}
          onPress={requestPermission}
        />
      )}
    </>
  );
};

export default PermissionHandler;
