import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {NativeEventSubscription} from 'react-native';
import {AppState, Linking, Platform} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import Navigation from '@navigation/Navigation';
import NavigationRoot from '@navigation/NavigationRoot';
// import PushNotification from '@libs/Notification/PushNotification';
import Log from '@libs/Log';
import migrateOnyx from '@libs/migrateOnyx';
import SplashScreenHider from '@components/SplashScreenHider';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as UserUtils from '@libs/UserUtils';
// import StartupTimer from '@libs/StartupTimer';
import Visibility from '@libs/Visibility';
import {useFirebase} from '@context/global/FirebaseContext';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Config} from '@src/types/onyx';
import {updateLastRoute} from '@libs/actions/App';
import setCrashlyticsUserId from '@libs/setCrashlyticsUserId';
import {useUserConnection} from '@context/global/UserConnectionContext';
import DBPATHS from '@database/DBPATHS';
import {listenForDataChanges, readDataOnce} from '@database/baseFunctions';
import {checkIfUnderMaintenance} from '@libs/Maintenance';
import {validateAppVersion} from '@libs/Validation';
import UnderMaintenanceModal from '@components/Modals/UnderMaintenanceModal';
import CONST from './CONST';
import UserOfflineModal from '@components/UserOfflineModal';
import SplashScreenStateContext from '@context/global/SplashScreenStateContext';
import CONFIG from './CONFIG';
import UpdateAppModal from '@components/UpdateAppModal';
import VerifyEmailModal from '@libs/VerifyEmailModal';

Onyx.registerLogger(({level, message}) => {
  if (level === 'alert') {
    Log.alert(message);
    console.error(message);
  } else {
    Log.info(message);
  }
});

type KirokuProps = {};

const SplashScreenHiddenContext = React.createContext({});

function Kiroku({}: KirokuProps) {
  const {db, auth} = useFirebase();
  const {isOnline} = useUserConnection();
  const appStateChangeListener = useRef<NativeEventSubscription | null>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isOnyxMigrated, setIsOnyxMigrated] = useState(false);
  const {splashScreenState, setSplashScreenState} = useContext(
    SplashScreenStateContext,
  );
  const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
  const [lastRoute] = useOnyx(ONYXKEYS.LAST_ROUTE);
  const [initialUrl, setInitialUrl] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticationChecked, setAuthenticationChecked] = useState(false);
  const [isFetchingConfig, setIsFetchingConfig] = useState<boolean>(true);
  const [config, setConfig] = useState<Config | null>(null);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState<boolean>(false);
  const [shouldShowVerifyEmailModal, setShouldShowVerifyEmailModal] =
    useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateRequired, setUpdateRequired] = useState<boolean>(false);
  const [shouldShowUpdateModal, setShouldShowUpdateModal] =
    useState<boolean>(false);

  // const isAuthenticated = useMemo(() => !!(auth.currentUser ?? null), [auth]);
  // const autoAuthState = useMemo(() => session?.autoAuthState ?? '', [session]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setAuthenticationChecked(true);

      // Check only once after the user is authenticated
      if (UserUtils.shouldShowVerifyEmailModal(user)) {
        setShouldShowVerifyEmailModal(true);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const configPath = DBPATHS.CONFIG;
    const stopListening = listenForDataChanges(
      db,
      configPath,
      (data: Config) => {
        setConfig(data);
        setIsFetchingConfig(false);
        if (!data) {
          console.debug(
            'Could not fetch the application configuration data from the database.',
          );
        }
      },
    );

    return () => stopListening();
  }, []);

  useMemo(() => {
    if (config) {
      const underMaintenance: boolean = checkIfUnderMaintenance(
        config?.maintenance,
      );
      const versionValidationResult = validateAppVersion(config.app_settings);
      const newUpdateAvailable = !!versionValidationResult?.updateAvailable;
      const newUpdateRequired = !versionValidationResult.success;
      const newShouldShowUpdateModal =
        !shouldShowVerifyEmailModal &&
        UserUtils.shouldShowUpdateModal(newUpdateAvailable, newUpdateRequired);

      setIsUnderMaintenance(underMaintenance);
      setUpdateAvailable(newUpdateAvailable);
      setUpdateRequired(newUpdateRequired);
      setShouldShowUpdateModal(newShouldShowUpdateModal);
    }
  }, [config, shouldShowVerifyEmailModal]);

  const shouldInit = isNavigationReady;
  // const shouldHideSplash =
  //   shouldInit && !isSplashHidden && authenticationChecked;

  const shouldHideSplash =
    shouldInit &&
    authenticationChecked &&
    splashScreenState === CONST.BOOT_SPLASH_STATE.VISIBLE;

  const initializeClient = () => {
    if (!Visibility.isVisible()) {
      return;
    }

    ActiveClientManager.init();
  };

  const setNavigationReady = useCallback(() => {
    setIsNavigationReady(true);

    // Navigate to any pending routes now that the NavigationContainer is ready
    Navigation.setIsNavigationReady();
  }, []);

  const onSplashHide = useCallback(() => {
    setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
    // Performance.markEnd(CONST.TIMING.SIDEBAR_LOADED);
  }, [setSplashScreenState]);

  useLayoutEffect(() => {
    // Initialize this client as being an active client
    ActiveClientManager.init();

    // Used for the offline indicator appearing when someone is offline
    // NetworkConnection.subscribeToNetInfo(); // TODO enable this
  }, []);

  // Log the platform and config to debug .env issues
  useEffect(() => {
    Log.info('App launched', false, {Platform});
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const appState = AppState.currentState;
      Log.info('[BootSplash] splash screen status', false, {
        appState,
        splashScreenState,
      });

      if (splashScreenState === CONST.BOOT_SPLASH_STATE.VISIBLE) {
        const propsToLog = {
          updateRequired,
          updateAvailable,
          // isSidebarLoaded,
          // focusModeNotification,
          isAuthenticated,
          lastVisitedPath,
        };
        Log.alert(
          '[BootSplash] splash screen is still visible',
          {propsToLog},
          false,
        );
      }
    }, 30 * 1000);

    // This timer is set in the native layer when launching the app and we stop it here so we can measure how long
    // it took for the main app itself to load.
    // StartupTimer.stop();

    // Run any Onyx schema migrations and then continue loading the main app
    migrateOnyx().then(() => {
      // In case of a crash that led to disconnection, we want to remove all the push notifications.
      if (!isAuthenticated) {
        // PushNotification.clearNotifications(); // TODO
      }

      setIsOnyxMigrated(true);
    });

    appStateChangeListener.current = AppState.addEventListener(
      'change',
      initializeClient,
    );

    // If the app is opened from a deep link, get the session ID (if exists) from the deep link and navigate to the session
    Linking.getInitialURL().then(url => {
      setInitialUrl(url);
      // DrinkingSession.openSessionFromDeepLink(url ?? '');// Report.openReportFromDeepLink
    });

    // Open ession from a deep link (only mobile native)
    // Linking.addEventListener('url', state => {
    //   // DrinkingSession.openSessionFromDeepLink(state.url); // Report.openReportFromDeepLink
    // });

    return () => {
      if (!appStateChangeListener.current) {
        return;
      }
      appStateChangeListener.current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
  }, []);

  useLayoutEffect(() => {
    if (!isNavigationReady || !lastRoute) {
      return;
    }
    updateLastRoute('');
    Navigation.navigate(lastRoute as Route);
    // Disabling this rule because we only want it to run on the first render.
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
  }, [isNavigationReady]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    setCrashlyticsUserId(auth?.currentUser?.uid ?? '-1');
  }, [isAuthenticated, auth?.currentUser?.uid]);

  // Display a blank page until the onyx migration completes
  if (!isOnyxMigrated) {
    return null;
  }

  if (updateRequired) {
    throw new Error(CONST.ERROR.UPDATE_REQUIRED);
  }

  return (
    // TODO
    // <DeeplinkWrapper
    //     isAuthenticated={isAuthenticated}
    //     autoAuthState={autoAuthState}
    // >
    <>
      {!isFetchingConfig && (
        <>
          {!isOnline && !CONFIG.IS_USING_EMULATORS && <UserOfflineModal />}
          {isUnderMaintenance && <UnderMaintenanceModal config={config} />}
        </>
      )}

      {shouldInit && (
        <>
          {shouldShowVerifyEmailModal && <VerifyEmailModal />}
          {shouldShowUpdateModal && <UpdateAppModal />}
          {/* // TODO show shared session invites here */}
        </>
      )}

      <NavigationRoot
        onReady={setNavigationReady}
        authenticated={isAuthenticated}
        lastVisitedPath={lastVisitedPath as Route}
        initialUrl={initialUrl}
      />
      {shouldHideSplash && <SplashScreenHider onHide={onSplashHide} />}
    </>
  );
}

export default Kiroku;
export {SplashScreenHiddenContext};
