import React, {useRef, useState, useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFirebase} from '@context/global/FirebaseContext';
import * as DS from '@libs/actions/DrinkingSession';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import {
  getUniqueDrinkTypesInSession,
  sumAllDrinks,
  sumDrinksOfSingleType,
  timestampToDateString,
  unitsToColors,
} from '@libs/DataHandling';
import type {DrinkingSession, Drinks, DrinkKey} from '@src/types/onyx';
import DrinkTypesView from '@components/DrinkTypesView';
import SessionDetailsWindow from '@components/SessionDetailsWindow';
import FillerView from '@components/FillerView';
import CONST from '@src/CONST';
import Navigation from '@navigation/Navigation';
import SCREENS from '@src/SCREENS';
import ROUTES from '@src/ROUTES';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import useLocalize from '@hooks/useLocalize';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import * as ErrorUtils from '@libs/ErrorUtils';
import ScrollView from '@components/ScrollView';
import Log from '@libs/Log';
import Icon from '@components/Icon';
import Onyx, {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import DateUtils from '@libs/DateUtils';
import {auth} from '@libs/Firebase/FirebaseApp';
import {DrinkingSessionWindowProps} from './types';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';

function DrinkingSessionWindow({
  sessionId,
  session,
  onyxKey,
  type,
}: DrinkingSessionWindowProps) {
  // Context, database, and authentification
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const theme = useTheme();
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const {preferences} = useDatabaseData();
  const {windowWidth} = useWindowDimensions();
  // const initialSession = useRef<DrinkingSession | undefined>(session);
  // // Session details
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [sessionColor, setSessionColor] = useState<string>('green');
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  // // Time info
  const [monkeMode, setMonkeMode] = useState<boolean>(false);
  // const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  // // Other
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [shouldShowLeaveConfirmation, setShouldShowLeaveConfirmation] =
    useState(false);
  // useState<boolean>(false);
  const sessionIsLive = session?.ongoing;
  const deleteSessionWording = session.ongoing
    ? translate('common.discard')
    : translate('common.delete');

  // const {isPending, enqueueUpdate} = useAsyncQueue(
  //   async (newSession: DrinkingSession) => syncWithDb(newSession),
  // );

  // const syncWithDb = async (newSessionData: DrinkingSession) => {
  //   if (!user || !session) {
  //     return;
  //   }
  //   try {
  //     setDbSyncSuccessful(false);
  //     await DS.saveDrinkingSessionData(
  //       db,
  //       user.uid,
  //       newSessionData,
  //       sessionId,
  //       true, // Update live session status
  //     );
  //     setDbSyncSuccessful(true);
  //   } catch (error: any) {
  //     throw new Error(translate('liveSessionScreen.error.save'));
  //   }
  // };

  // TODO
  const hasSessionChanged = () => false;
  // const hasSessionChanged = () => {
  //   return !isEqual(initialSession.current, session);
  // };

  const handleMonkePlus = () => {
    DS.updateDrinks(
      sessionId,
      CONST.DRINKS.KEYS.OTHER,
      1,
      CONST.DRINKS.ACTIONS.ADD,
      preferences?.drinks_to_units,
    );
  };

  const handleMonkeMinus = () => {
    if (!session) {
      return;
    }
    const otherUnitsLeft = sumDrinksOfSingleType(
      session.drinks,
      CONST.DRINKS.KEYS.OTHER,
    );
    let keyToRemove: DrinkKey | null = null;
    if (otherUnitsLeft > 0) {
      // Try to remove a drink from 'others' first
      keyToRemove = CONST.DRINKS.KEYS.OTHER;
    } else if (sumAllDrinks(session.drinks) > 0) {
      // In case there are no other drinks, remove one at random
      const drinkKeysLeft = getUniqueDrinkTypesInSession(session);
      if (!drinkKeysLeft) {
        return;
      }
      keyToRemove =
        drinkKeysLeft[Math.floor(Math.random() * drinkKeysLeft.length)];
    }
    if (keyToRemove) {
      DS.updateDrinks(
        sessionId,
        keyToRemove,
        1,
        CONST.DRINKS.ACTIONS.REMOVE,
        preferences?.drinks_to_units,
      );
    }
  };

  // // Function to wait for pending updates to finish
  // const waitForNoPendingUpdate = async () => {
  //   while (isPending) {
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //   }
  // };

  /** Determine the screen to return to, and navigate to it */
  const navigateBackDynamically = (
    action: DeepValueOf<typeof CONST.NAVIGATION.SESSION_ACTION>,
  ) => {
    const previousScreenName = Navigation.getLastScreenName(true);

    const routesMap = {
      SAVE: () => ROUTES.DRINKING_SESSION_SUMMARY.getRoute(sessionId),
      DISCARD: () => ROUTES.HOME,
    };

    const navigateToOverview = () =>
      ROUTES.DAY_OVERVIEW.getRoute(
        timestampToDateString(session?.start_time || Date.now()),
      );

    // Decide the route based on the action or previous screen
    const route =
      previousScreenName === SCREENS.DAY_OVERVIEW.ROOT
        ? navigateToOverview
        : routesMap[action];

    Navigation.navigate(route());
  };

  async function saveSession(db: any, userID: string) {
    if (!session || !user) {
      return;
    }
    if (totalUnits > CONST.MAX_ALLOWED_UNITS) {
      Log.warn(translate('liveSessionScreen.error.save'));
      return null;
    }
    if (totalUnits <= 0) {
      // TODO inform the user why the they can not save their session - 0 units
      return;
    }
    try {
      setLoadingText(translate('liveSessionScreen.saving'));
      setSessionFinished(true); // No more db syncs
      const newSessionData: DrinkingSession = {
        ...session,
        end_time: sessionIsLive ? Date.now() : session.start_time,
      };
      delete newSessionData.ongoing;
      delete newSessionData.id;
      // Wait for any pending updates to resolve first
      // TODO
      // while (isPending) {
      //   await new Promise(resolve => setTimeout(resolve, 100));
      // }
      if (sessionIsLive) {
        await DS.endLiveDrinkingSession(db, userID, newSessionData, sessionId);
      } else {
        await DS.saveDrinkingSessionData(
          db,
          userID,
          newSessionData,
          sessionId,
          false, // Do not update live status
          // true, // Clean the local onyx edit session data
        );
      }
    } catch (error: any) {
      Alert.alert(
        translate('liveSessionScreen.error.saveTitle'),
        translate('liveSessionScreen.error.save'),
      );
    } finally {
      // Reroute to session summary, do not allow user to return
      navigateBackDynamically(CONST.NAVIGATION.SESSION_ACTION.SAVE);
      setLoadingText('');
    }
  }

  const handleDiscardSession = async () => {
    // await waitForNoPendingUpdate(); // TODO
    setDiscardModalVisible(true);
  };

  const handleConfirmDiscard = async () => {
    if (!user) {
      return;
    }
    try {
      setLoadingText(
        translate(
          'liveSessionScreen.discardingSession',
          sessionIsLive ? 'Discarding' : 'Deleting',
        ),
      );
      const discardFunction = sessionIsLive
        ? DS.discardLiveDrinkingSession
        : DS.removeDrinkingSessionData;
      // await waitForNoPendingUpdate();
      await discardFunction(db, user.uid, sessionId);
      Onyx.set(onyxKey, null);
    } catch (error: any) {
      ErrorUtils.raiseAlert(
        error,
        translate('liveSessionScreen.error.discardTitle'),
        translate('liveSessionScreen.error.discard'),
      );
    } finally {
      navigateBackDynamically(CONST.NAVIGATION.SESSION_ACTION.DISCARD);
      setDiscardModalVisible(false);
      setLoadingText('');
    }
  };

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (!sessionIsLive && hasSessionChanged()) {
      setShouldShowLeaveConfirmation(true); // Unsaved changes
      return;
    }
    if (sessionIsLive) {
      try {
        setLoadingText(translate('liveSessionScreen.synchronizing'));
        // await waitForNoPendingUpdate(); // TODO
      } catch (error: any) {
        Alert.alert('Database synchronization failed', error.message);
      } finally {
        setLoadingText('');
      }
    }
    confirmGoBack();
  };

  const confirmGoBack = async () => {
    setShouldShowLeaveConfirmation(false);
    Navigation.goBack();
  };

  // Fetch the session object at component mount
  // useEffect(() => {
  //   const newSession =
  //     liveSessionData?.id === sessionId ? liveSessionData : editSessionData;
  //   setSession(newSession);
  //   setSessionIsLive(!!newSession?.ongoing);

  //   // Set the intial session ref upon the first load
  //   if (isFetchingSessionData) {
  //     initialSession.current = newSession;
  //     setIsFetchingSessionData(false);
  //   }
  // }, []);

  // Update the hooks whenever drinks change
  useMemo(() => {
    if (!preferences) {
      return;
    }
    const totalUnits = DSUtils.calculateTotalUnits(
      session?.drinks,
      preferences.drinks_to_units,
      true,
    );
    const sessionColor = unitsToColors(totalUnits, preferences.units_to_colors);
    setTotalUnits(totalUnits);
    setSessionColor(sessionColor);
  }, [session?.drinks]);

  // Synchronize the session with database
  // useEffect(() => {
  //   // Only schedule a database update if any hooks changed
  //   // Do not automatically save if the session is over, or
  //   // if the initial fetch has not finished
  //   if (!user || !sessionIsLive || !session || sessionFinished) {
  //     return;
  //   }
  //   enqueueUpdate({...session, ongoing: true});
  // }, [session]);

  // Make the system back press toggle the go back handler
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent the event from bubbling up and being handled by the default handler
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [session]);

  if (loadingText) {
    return <FlexibleLoadingIndicator text={loadingText} />;
  }
  if (!user || !preferences) {
    Navigation.resetToHome();
    return;
  }

  return (
    <>
      <HeaderWithBackButton
        // onBackButtonPress={handleBackPress}
        customRightButton={
          <Button
            onPress={() => setMonkeMode(!monkeMode)}
            text={translate(
              monkeMode
                ? 'liveSessionScreen.exitMonkeMode'
                : 'liveSessionScreen.enterMonkeMode',
            )}
            style={[
              styles.buttonMedium,
              monkeMode ? styles.buttonSuccessPressed : styles.buttonSuccess,
            ]}
            textStyles={styles.buttonLargeText}
          />
        }
      />
      <ScrollView contentContainerStyle={[styles.w100]}>
        <View style={styles.pt2}>
          <View style={styles.alignItemsCenter}>
            <Text style={styles.textHeadlineH2}>
              {session?.ongoing
                ? `${translate('liveSessionScreen.sessionFrom')} ${DateUtils.getLocalizedTime(session.start_time, session.timezone)}`
                : `${translate('liveSessionScreen.sessionOn')} ${DateUtils.getLocalizedDay(session.start_time, session.timezone)}`}
            </Text>
          </View>
        </View>
        <View style={localStyles.unitCountContainer}>
          <Text style={[localStyles.unitCountText, {color: sessionColor}]}>
            {totalUnits}
          </Text>
        </View>
        {monkeMode ? (
          <View style={localStyles.modifyUnitsContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              style={[localStyles.modifyUnitsButton, {backgroundColor: 'red'}]}
              onPress={() => handleMonkeMinus()}>
              <Icon
                src={KirokuIcons.Minus}
                height={60}
                width={40}
                fill={theme.textLight}
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={[
                localStyles.modifyUnitsButton,
                {backgroundColor: 'green'},
              ]}
              onPress={() => handleMonkePlus()}>
              <Icon
                src={KirokuIcons.Plus}
                height={40}
                width={40}
                fill={theme.textLight}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <DrinkTypesView sessionId={sessionId} />
            <SessionDetailsWindow
              sessionId={sessionId}
              session={session}
              onBlackoutChange={(value: boolean) =>
                DS.updateBlackout(session, value)
              }
              shouldAllowDateChange={session.type !== CONST.SESSION_TYPES.LIVE}
              shouldAllowTimezoneChange={
                !session?.ongoing
                // session.type !== CONST.SESSION_TYPES.LIVE // Enable this down the line
              }
            />
          </>
        )}
        <FillerView />
      </ScrollView>
      <View style={styles.bottomTabBarContainer(true)}>
        <Button
          text={translate(
            'liveSessionScreen.discardSession',
            deleteSessionWording,
          )}
          textStyles={styles.buttonText}
          innerStyles={[
            styles.bottomTabBarItem,
            styles.halfScreenWidth(windowWidth * 0.75),
            styles.mr5,
            styles.mt2,
          ]}
          onPress={handleDiscardSession}
        />
        <Button
          success
          text={translate('liveSessionScreen.saveSession')}
          textStyles={styles.buttonText}
          innerStyles={[
            styles.bottomTabBarItem,
            styles.halfScreenWidth(windowWidth * 0.75),
            styles.mt2,
          ]}
          onPress={() => saveSession(db, user.uid)}
        />
      </View>
      <ConfirmModal
        danger
        title={translate('common.warning')}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardModalVisible(false)}
        isVisible={discardModalVisible}
        prompt={translate(
          'liveSessionScreen.discardSessionWarning',
          deleteSessionWording.toLowerCase(),
        )}
        confirmText={translate('common.yes')}
        cancelText={translate('common.no')}
        shouldDisableConfirmButtonWhenOffline
        shouldShowCancelButton
      />
      <ConfirmModal
        title={translate('common.warning')}
        onConfirm={() => confirmGoBack()} // No changes to the session object
        onCancel={() => setShouldShowLeaveConfirmation(false)}
        isVisible={shouldShowLeaveConfirmation}
        prompt={translate('liveSessionScreen.unsavedChangesWarning')}
        confirmText={translate('common.yes')}
        cancelText={translate('common.no')}
        shouldShowCancelButton
      />
      <ConfirmModal
        title={translate('common.warning')}
        onConfirm={() => confirmGoBack()} // No changes to the session object
        onCancel={() => setShouldShowLeaveConfirmation(false)}
        isVisible={shouldShowLeaveConfirmation}
        prompt={translate('liveSessionScreen.unsavedChangesWarning')}
        confirmText={translate('common.yes')}
        cancelText={translate('common.no')}
        shouldShowCancelButton
      />
    </>
  );
}

const localStyles = StyleSheet.create({
  unitCountContainer: {},
  unitCountText: {
    fontSize: 90,
    fontWeight: 'bold',
    // marginTop: 5,
    marginBottom: 10,
    alignSelf: 'center',
    alignContent: 'center',
    padding: 2,
    textShadowColor: '#000',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  modifyUnitsContainer: {
    height: 400,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  modifyUnitsButton: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
});

export default DrinkingSessionWindow;
