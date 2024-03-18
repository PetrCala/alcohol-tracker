import Navigation from '@navigation/Navigation';
import NavigationRoot from '@navigation/NavigationRoot';
import PropTypes from 'prop-types';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// import BootSplash from './libs/BootSplash';
import Visibility from './libs/Visibility';
import {AppState, Linking} from 'react-native';
import {useFirebase} from '@context/global/FirebaseContext';

const propTypes = {
  /** Whether a new update is available and ready to install. */
  updateAvailable: PropTypes.bool,

  /** True when the user must update to the latest minimum version of the app */
  updateRequired: PropTypes.bool,

  /** Last visited path in the app */
  lastVisitedPath: PropTypes.string,
};

const defaultProps = {
  updateAvailable: false,
  updateRequired: false,
  lastVisitedPath: undefined,
};

// function Kiroku(props) {
function Kiroku(props) {
  const {auth} = useFirebase();
  const appStateChangeListener = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isSplashHidden, setIsSplashHidden] = useState(false);
  const [initialUrl, setInitialUrl] = useState(null);

  const contextValue = useMemo(
    () => ({
      isSplashHidden,
    }),
    [isSplashHidden],
  );

  const shouldInit = isNavigationReady;
  const shouldHideSplash = shouldInit && !isSplashHidden;

  const initializeClient = () => {
    if (!Visibility.isVisible()) {
      return;
    }

    // ActiveClientManager.init();
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const setNavigationReady = useCallback(() => {
    setIsNavigationReady(true);

    // Navigate to any pending routes now that the NavigationContainer is ready
    Navigation.setIsNavigationReady();
  }, []);

  const onSplashHide = useCallback(() => {
    setIsSplashHidden(true);
  }, []);

  // useLayoutEffect(() => {
  // Initialize this client as being an active client
  // ActiveClientManager.init();

  //     // Used for the offline indicator appearing when someone is offline
  //     NetworkConnection.subscribeToNetInfo();
  // }, []);

  useEffect(() => {
    // Run any Onyx schema migrations and then continue loading the main app
    // migrateOnyx().then(() => {
    //   // In case of a crash that led to disconnection, we want to remove all the push notifications.
    //   if (!isAuthenticated) {
    //     PushNotification.clearNotifications();
    //   }

    //   setIsOnyxMigrated(true);
    // });

    appStateChangeListener.current = AppState.addEventListener(
      'change',
      initializeClient,
    );

    // If the app is opened from a deep link, get the reportID (if exists) from the deep link and navigate to the chat report
    Linking.getInitialURL().then(url => {
      setInitialUrl(url);
    });

    return () => {
      if (!appStateChangeListener.current) {
        return;
      }
      appStateChangeListener.current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
  }, []);

  // if (props.updateRequired) {
  //   throw new Error(CONST.ERROR.UPDATE_REQUIRED);
  // }

  // {/* {props.updateAvailable && !props.updateRequired ? (
  //   <UpdateAppModal />
  // ) : null} */}

  return (
    <>
      {shouldInit && (
        <>
          {/* {props.updateAvailable && !props.updateRequired ? <UpdateAppModal /> : null} */}
        </>
      )}
      <NavigationRoot
        onReady={setNavigationReady}
        authenticated={isAuthenticated}
        lastVisitedPath={props.lastVisitedPath}
        initialUrl={initialUrl}
      />
    </>
  );
}

Kiroku.propTypes = propTypes;
Kiroku.defaultProps = defaultProps;

export default Kiroku;
