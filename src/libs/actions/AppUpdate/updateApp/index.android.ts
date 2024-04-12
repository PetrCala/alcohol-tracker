import {Linking} from 'react-native';
import CONST from '@src/CONST';

export default function updateApp() {
  Linking.openURL(CONST.STORE_LINKS.ANDROID);
}
