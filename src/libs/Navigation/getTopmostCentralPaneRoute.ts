import {isCentralPaneName} from '@libs/NavigationUtils';
import type {
  CentralPaneName,
  NavigationPartialRoute,
  RootStackParamList,
  State,
} from './types';

// Get the name of topmost central pane route in the navigation stack.
function getTopmostCentralPaneRoute(
  state: State<RootStackParamList>,
): NavigationPartialRoute<CentralPaneName> | undefined {
  if (!state) {
    return;
  }

  const centralPaneRoutes = state.routes.filter(route =>
    isCentralPaneName(route.name),
  );

  if (centralPaneRoutes.length === 0) {
    return;
  }

  return centralPaneRoutes[
    centralPaneRoutes.length - 1
  ] as NavigationPartialRoute<CentralPaneName>;
}

export default getTopmostCentralPaneRoute;
