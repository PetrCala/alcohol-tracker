/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import CONFIG from './src/CONFIG';
import additionalAppSetup from './src/setup';

AppRegistry.registerComponent(CONFIG.APP_NAME, () => App);
additionalAppSetup();
