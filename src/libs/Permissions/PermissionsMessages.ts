import * as Localize from '@libs/Localize';
import type {PermissionKey} from './PermissionsUtils';

const permissionsMessages: Record<PermissionKey, Record<string, string>> = {
  camera: {
    title: Localize.translateLocal('permissions.camera.title'),
    message: Localize.translateLocal('permissions.camera.message'),
  },
  read_photos: {
    title: Localize.translateLocal('permissions.read_photos.title'),
    message: Localize.translateLocal('permissions.read_photos.message'),
  },
  write_photos: {
    title: Localize.translateLocal('permissions.write_photos.title'),
    message: Localize.translateLocal('permissions.write_photos.message'),
  },
  notifications: {
    title: Localize.translateLocal('permissions.notifications.title'),
    message: Localize.translateLocal('permissions.notifications.message'),
  },
  // location: {
  //   title: 'Location Access',
  //   message: 'This app needs access to your location for navigation purposes.',
  // },
};

export default permissionsMessages;
