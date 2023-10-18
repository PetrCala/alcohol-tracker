// SinglePermissionHandler.js
import React, { useState, useEffect } from 'react';
import { Button, Alert, Platform } from 'react-native';
import {
    check,
    PERMISSIONS,
    request,
    RESULTS,
    requestNotifications,
    checkNotifications
} from 'react-native-permissions';
import { PermissionKey, permissionsMap } from './PermissionList';

type PermissionHandlerProps = {
    permissionType: PermissionKey;
    children: any;
};

/** TODO
 * 
 * 
 * @example
 *  <SinglePermissionHandler permissionType="camera">
 *     <CameraComponent />
 *  </SinglePermissionHandler>
 */
const PermissionHandler: React.FC<PermissionHandlerProps> = ({ 
    permissionType, 
    children 
}) => {
    const [permissionsGranted, setPermissionsGranted] = useState(false);

    useEffect(() => {
        if (permissionType === "notifications" && Platform.OS === 'ios') {
            checkNotificationPermission();
        } else {
            checkPermission();
        }
    }, [permissionType]);

    // Perhaps emply checkMultiple, requestMultiple,...

    const getPermission = () => {
        return permissionsMap[permissionType][Platform.OS];
    };

    const checkPermission = async () => {
        const status = await check(getPermission());
        handlePermissionStatus(status);
    };

    const checkNotificationPermission = async () => {
        const { status } = await checkNotifications();
        handlePermissionStatus(status);
    };

    const handlePermissionStatus = (status: string) => {
        if (status === RESULTS.GRANTED) {
            setPermissionsGranted(true);
        }
    };

    const requestPermission = async () => {
        let status: string;
        if (permissionType === "notifications" && Platform.OS === 'ios') {
            const response = await requestNotifications(["alert", "sound"]);
            status = response.status;
        } else {
            status = await request(getPermission());
        }

        if (status === RESULTS.GRANTED) {
            setPermissionsGranted(true);
        } else {
            Alert.alert("Permission Denied", "This functionality might not work properly!");
        }
    };

    return (
        <>
            {permissionsGranted ? (
                children
            ) : (
                <Button title={`Request ${permissionType} permission`} onPress={requestPermission} />
            )}
        </>
    );
};

export default PermissionHandler;