/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from '@src/App';
import CONFIG from '@src/CONFIG';
console.log(
  'registering the app component under name',
  CONFIG.COMPONENT_NAME,
  '...',
);

AppRegistry.registerComponent(CONFIG.COMPONENT_NAME, () => App);
