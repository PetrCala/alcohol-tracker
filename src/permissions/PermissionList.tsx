import { PERMISSIONS } from 'react-native-permissions';

export type PermissionKey = 'camera' | 'notifications' | 'read_photos' | 'write_photos';

export type PermissionEntry = {[key: string]: any}

export const permissionsMap: Record<PermissionKey, PermissionEntry> = {
    'camera': {
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
    },
    'read_photos': {
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    },
    'write_photos': {
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    },
    'notifications': {
        ios: undefined, // Handle through the checkNotifications, requestNotifications functions
        android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    }
};