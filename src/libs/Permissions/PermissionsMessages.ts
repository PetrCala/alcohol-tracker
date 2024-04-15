import type {PermissionKey} from './PermissionsUtils';

const permissionsMessages: Record<PermissionKey, Record<string, string>> = {
  camera: {
    title: 'Camera Access Required',
    message: 'This app needs access to your camera for taking pictures.',
  },
  read_photos: {
    title: 'Access to Photos Required',
    message: 'This app requires access to your photos to function properly.',
  },
  write_photos: {
    title: 'Write Photos Access Required',
    message: 'This app needs access to write photos to your device.',
  },
  notifications: {
    title: 'Notification Access Required',
    message: 'This app needs access to send notifications to your device.',
  },
  // location: {
  //   title: 'Location Access',
  //   message: 'This app needs access to your location for navigation purposes.',
  // },
};

export default permissionsMessages;
