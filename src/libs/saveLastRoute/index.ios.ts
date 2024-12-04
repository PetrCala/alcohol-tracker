import {updateLastRoute} from '@userActions/App';
import Navigation from '@libs/Navigation/Navigation';

export default function saveLastRoute() {
  updateLastRoute(Navigation.getActiveRoute());
}
