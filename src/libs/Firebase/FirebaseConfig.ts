import {FirebaseOptions} from 'firebase/app';
import CONFIG from '@src/CONFIG';

/**
 * Create and return the FirebaseConfig object to be used to initialize Firebase in the application.
 *
 * Example Usage:
 * This configuration object is typically used to initialize Firebase in the application,
 * ensuring that the correct environment settings are applied.
 *
 * ```
 * import { initializeApp } from 'firebase/app';
 *
 * // Initialize Firebase with the dynamic configuration
 * initializeApp(FirebaseConfig);
 * ```
 */
const FirebaseConfig: FirebaseOptions = (() => {
  return CONFIG.FIREBASE_CONFIG;
})();

export default FirebaseConfig;
