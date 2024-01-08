import { FirebaseOptions } from "firebase/app";
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

/**
 * Dynamically and automatically sets Firebase configuration based on the current application environment. 
 *
 * Available environments:
 * - `CONST.ENVIRONMENT.TEST`: Test environment.
 * - `CONST.ENVIRONMENT.DEV`: Development environment.
 * - `CONST.ENVIRONMENT.PROD`: Production environment.
 *
 * Throws:
 * - Throws an error if the `APP_ENVIRONMENT` is not one of the predefined environments.
 *
 * Example Usage:
 * This configuration object is typically used to initialize Firebase in the application, 
 * ensuring that the correct environment settings are applied.
 *
 * ```
 * import { initializeApp } from 'firebase/app';
 * 
 * // Initialize Firebase with the dynamic configuration
 * initializeApp(firebaseConfig);
 * ```
 */
const firebaseConfig: FirebaseOptions = (() => {
    switch (CONFIG.APP_ENVIRONMENT) {
        case CONST.ENVIRONMENT.TEST:
            return CONFIG.DB_CONFIG_TEST;
        case CONST.ENVIRONMENT.DEV:
            return CONFIG.DB_CONFIG_DEV;
        case CONST.ENVIRONMENT.PROD:
            return CONFIG.DB_CONFIG_PROD;
        default:
            throw new Error('Invalid environment');
    }
})();

export default firebaseConfig;