export const getPreviousRouteName = (navigation: any) => {
  const state = navigation.getState();
  const routes = state.routes;
  const currentRouteIndex = state.index;

  // Check if there is a previous state
  if (currentRouteIndex > 0) {
    return routes[currentRouteIndex - 1].name;
  }

  return null; // No previous route
};

// /**
//  * Main navigation method for redirecting to a route.
//  * @param [type] - Type of action to perform. Currently UP is supported.
//  */
// function navigate(route: Route = ROUTES.HOME, type?: string) {
//     if (!canNavigate('navigate', {route})) {
//         // Store intended route if the navigator is not yet available,
//         // we will try again after the NavigationContainer is ready
//         Log.hmmm(`[Navigation] Container not yet ready, storing route as pending: ${route}`);
//         pendingRoute = route;
//         return;
//     }
//     linkTo(navigationRef.current, route, type, isActiveRoute(route));
// }
