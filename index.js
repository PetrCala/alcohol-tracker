/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Kiroku from './src/App';

// Define the component names
const componentNameIOS = 'kiroku';
const componentNameAndroid = 'alcohol_tracker';

// Select the component name based on the platform
const componentName = Platform.OS === 'ios' ? componentNameIOS : componentNameAndroid;

AppRegistry.registerComponent(componentName, () => Kiroku);