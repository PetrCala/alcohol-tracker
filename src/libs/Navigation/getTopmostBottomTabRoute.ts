import NAVIGATORS from '@src/NAVIGATORS';
import type {
  BottomTabName,
  NavigationPartialRoute,
  RootStackParamList,
  State,
} from './types';

function getTopmostBottomTabRoute(
  state: State<RootStackParamList> | undefined,
): NavigationPartialRoute<BottomTabName> | undefined {
  const bottomTabNavigatorRoute = state?.routes
    .slice()
    .reverse()
    .find(route => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR); // findLast

  // The bottomTabNavigatorRoute state may be empty if we just logged in.
  if (
    !bottomTabNavigatorRoute ||
    bottomTabNavigatorRoute.name !== NAVIGATORS.BOTTOM_TAB_NAVIGATOR ||
    bottomTabNavigatorRoute.state === undefined
  ) {
    return undefined;
  }

  const topmostBottomTabRoute =
    bottomTabNavigatorRoute.state.routes[
      bottomTabNavigatorRoute.state.routes.length - 1
    ];

  if (!topmostBottomTabRoute) {
    throw new Error('BottomTabNavigator route have no routes.');
  }

  return {
    name: topmostBottomTabRoute.name as BottomTabName,
    params: topmostBottomTabRoute.params,
  };
}

export default getTopmostBottomTabRoute;
