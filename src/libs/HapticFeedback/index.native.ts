import type HapticFeedback from './types';

/**
 * Web does not support Haptic feedback
 */
const hapticFeedback: HapticFeedback = {
  press: () => {},
  longPress: () => {},
  success: () => {},
  error: () => {},
};

export default hapticFeedback;

// The react-native-haptic-feedback package had broken compilation on iOS for version 2.2.0, so we removed it. Otherwise, this would be the native implementation

// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
// import type HapticFeedback from './types';

// const hapticFeedback: HapticFeedback = {
//   press: () => {
//     ReactNativeHapticFeedback.trigger('impactLight', {
//       enableVibrateFallback: true,
//     });
//   },
//   longPress: () => {
//     ReactNativeHapticFeedback.trigger('impactHeavy', {
//       enableVibrateFallback: true,
//     });
//   },
//   success: () => {
//     ReactNativeHapticFeedback.trigger('notificationSuccess', {
//       enableVibrateFallback: true,
//     });
//   },
//   error: () => {
//     ReactNativeHapticFeedback.trigger('notificationError', {
//       enableVibrateFallback: true,
//     });
//   },
// };

// export default hapticFeedback;
