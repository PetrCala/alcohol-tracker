import type {NavigationState} from '@react-navigation/native';
import {
  DefaultTheme,
  findFocusedRoute,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef} from 'react';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import AppNavigator from './AppNavigator';
import linkingConfig from './linkingConfig';
import customGetPathFromState from './linkingConfig/customGetPathFromState';
import Navigation, {navigationRef} from './Navigation';
import type {RootStackParamList} from './types';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useTheme from '@hooks/useTheme';
import {updateLastVisitedPath} from '@libs/actions/App';
import getAdaptedStateFromPath from './linkingConfig/getAdaptedStateFromPath';
import {getPathFromURL} from '@libs/Url';

type NavigationRootProps = {
  /** Whether the current user is logged in with an authToken */
  // authenticated: boolean;

  /** Stores path of last visited page */
  lastVisitedPath: Route;

  /** Initial url */
  initialUrl: string | null;

  /** Fired when react-navigation is ready */
  onReady: () => void;
};

/**
 * Intercept navigation state changes and log it
 */
function parseAndLogRoute(state: NavigationState) {
  if (!state) {
    return;
  }

  const currentPath = customGetPathFromState(state, linkingConfig.config);

  const focusedRoute = findFocusedRoute(state);

  if (focusedRoute?.name !== SCREENS.NOT_FOUND) {
    updateLastVisitedPath(currentPath); // TODO implement this
  }

  Navigation.setIsNavigationReady();
}

// function NavigationRoot({authenticated, lastVisitedPath, initialUrl, onReady}: NavigationRootProps) {
function NavigationRoot({
  lastVisitedPath,
  initialUrl,
  onReady,
}: NavigationRootProps) {
  // useFlipper(navigationRef); // Uncomment this
  const firstRenderRef = useRef(true);
  const theme = useTheme();

  const {isSmallScreenWidth} = useWindowDimensions();
  // const {setActiveWorkspaceID} = useActiveWorkspace();

  const initialState = useMemo(
    () => {
      if (!lastVisitedPath) {
        return undefined;
      }

      const path = initialUrl ? getPathFromURL(initialUrl) : null;

      // For non-nullable paths we don't want to set initial state
      if (path) {
        return;
      }

      const {adaptedState} = getAdaptedStateFromPath(
        lastVisitedPath,
        linkingConfig.config,
      );
      return adaptedState;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // https://reactnavigation.org/docs/themes
  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.appBG,
      },
    }),
    [theme],
  );

  useEffect(() => {
    if (firstRenderRef.current) {
      // we don't want to make the report back button go back to LHN if the user
      // started on the small screen so we don't set it on the first render
      // making it only work on consecutive changes of the screen size
      firstRenderRef.current = false;
      return;
    }
    if (!isSmallScreenWidth) {
      return;
    }
    Navigation.setShouldPopAllStateOnUP();
  }, [isSmallScreenWidth]);

  const handleStateChange = (state: NavigationState | undefined) => {
    if (!state) {
      return;
    }
    // const activeWorkspaceID = getPolicyIDFromState(state as NavigationState<RootStackParamList>);
    // Performance optimization to avoid context consumers to delay first render
    // setTimeout(() => {
    //   currentReportIDValue?.updateCurrentReportID(state);
    //   setActiveWorkspaceID(activeWorkspaceID);
    // }, 0);
    parseAndLogRoute(state);
  };

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={handleStateChange}
      onReady={onReady}
      theme={navigationTheme}
      ref={navigationRef}
      linking={linkingConfig}
      documentTitle={{
        enabled: false,
      }}>
      <AppNavigator />
    </NavigationContainer>
  );
}

NavigationRoot.displayName = 'NavigationRoot';

export default NavigationRoot;
