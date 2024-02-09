export const getPreviousRouteName = (navigation:any) => {
    const state = navigation.getState();
    const routes = state.routes;
    const currentRouteIndex = state.index;

    // Check if there is a previous state
    if (currentRouteIndex > 0) {
        return routes[currentRouteIndex - 1].name;
    }

    return null; // No previous route
};