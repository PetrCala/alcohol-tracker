import {useFocusEffect, useRoute} from '@react-navigation/native';
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
import {
  discardLiveDrinkingSession,
  endLiveDrinkingSession,
  removeDrinkingSessionData,
  removePlaceholderSessionData,
  saveDrinkingSessionData,
  updateSessionDrinks,
} from '@database/drinkingSessions';
import {
  addDrinks,
  formatDateToTime,
  getUniqueDrinkTypesInSession,
  removeDrinks,
  sumAllDrinks,
  sumAllUnits,
  sumDrinksOfSingleType,
  timestampToDate,
  timestampToDateString,
  unitsToColors,
} from '@libs/DataHandling';
import type {
  DrinkingSession,
  DrinksList,
  Drinks,
  DrinkKey,
} from '@src/types/onyx';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import {useUserConnection} from '@context/global/UserConnectionContext';
import UserOffline from '@components/UserOfflineModal';
import DrinkTypesView from '@components/DrinkTypesView';
import SessionDetailsSlider from '@components/SessionDetailsSlider';
import SuccessIndicator from '@components/SuccessIndicator';
import commonStyles from '@styles/commonStyles';
import FillerView from '@components/FillerView';
import CONST from '@src/CONST';
import Navigation from '@navigation/Navigation';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import ROUTES from '@src/ROUTES';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {isEqual} from 'lodash';
import {readDataOnce} from '@database/baseFunctions';
import DBPATHS from '@database/DBPATHS';
import useAsyncQueue from '@hooks/useAsyncQueue';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import ScreenWrapper from '@components/ScreenWrapper';
import DrinkData from '@libs/DrinkData';
import useLocalize from '@hooks/useLocalize';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {format} from 'date-fns';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import ScrollView from '@components/ScrollView';
import Log from '@libs/Log';
import Icon from '@components/Icon';

type LiveSessionScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.LIVE
>;

function LiveSessionScreen({route}: LiveSessionScreenProps) {
  const {sessionId} = route.params;
  // Context, database, and authentification
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const theme = useTheme();
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const {isOnline} = useUserConnection();
  const {preferences} = useDatabaseData();
  const {windowWidth} = useWindowDimensions();
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const initialSession = useRef<DrinkingSession | null>(null);
  // Session details
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [availableUnits, setAvailableUnits] = useState<number>(0);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  // Time info
  const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  const sessionDate = timestampToDate(session?.start_time ?? Date.now());
  const sessionDateString = format(sessionDate, CONST.DATE.SHORT_DATE_FORMAT);
  const sessionStartTime = formatDateToTime(sessionDate);
  const sessionColor = preferences
    ? unitsToColors(totalUnits, preferences.units_to_colors)
    : 'green';
  // Other
  const [monkeMode, setMonkeMode] = useState<boolean>(false);
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);
  const [openingSession, setOpeningSession] = useState<boolean>(true);
  const [loadingText, setLoadingText] = useState<string>('');
  const [shouldShowLeaveConfirmation, setShouldShowLeaveConfirmation] =
    useState(false);
  const [isPlaceholderSession, setIsPlaceholderSession] =
    useState<boolean>(false);
  const [sessionIsLive, setSessionIsLive] = useState<boolean | null>(null);
  const deleteSessionWording = session?.ongoing
    ? translate('common.discard')
    : translate('common.delete');

  const {isPending, enqueueUpdate} = useAsyncQueue(
    async (newSession: DrinkingSession) => syncWithDb(newSession),
  );

  const syncWithDb = async (newSessionData: DrinkingSession) => {
    if (!user || !session) {
      return;
    }
    try {
      setDbSyncSuccessful(false);
      await saveDrinkingSessionData(
        db,
        user.uid,
        newSessionData,
        sessionId,
        true, // Update live session status
      );
      setDbSyncSuccessful(true);
    } catch (error: any) {
      throw new Error(translate('liveSessionScreen.error.save'));
    }
  };

  const hasSessionChanged = () => {
    return !isEqual(initialSession.current, session);
  };

  const handleMonkePlus = () => {
    if (!session) {
      return;
    }
    if (availableUnits > 0) {
      const drinksToAdd: Drinks = {other: 1};
      const newDrinks: DrinksList | undefined = addDrinks(
        session?.drinks,
        drinksToAdd,
      );
      setSession({...session, drinks: newDrinks});
    }
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
      const newDrinks: DrinksList | undefined = removeDrinks(
        session.drinks,
        keyToRemove,
        1,
      );
      setSession({...session, drinks: newDrinks});
    }
  };

  const handleBlackoutChange = (value: boolean) => {
    if (!session) {
      return;
    }
    setSession({...session, blackout: value});
  };

  const setCurrentDrinks = (newDrinks: DrinksList | undefined) => {
    if (!session) {
      return;
    }
    setSession({...session, drinks: newDrinks});
  };

  // Function to wait for pending updates to finish
  const waitForNoPendingUpdate = async () => {
    while (isPending) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

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

  // Update the hooks whenever drinks change
  useMemo(() => {
    if (!preferences) {
      return;
    }
    const newTotalUnits = sumAllUnits(
      session?.drinks,
      preferences.drinks_to_units,
    );
    const newAvailableUnits = CONST.MAX_ALLOWED_UNITS - newTotalUnits;
    setTotalUnits(newTotalUnits);
    setAvailableUnits(newAvailableUnits);
  }, [session?.drinks]);

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
      // Wait for any pending updates to resolve first
      while (isPending) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (sessionIsLive) {
        await endLiveDrinkingSession(db, userID, newSessionData, sessionId);
      } else {
        await saveDrinkingSessionData(
          db,
          userID,
          newSessionData,
          sessionId,
          false, // Do not update live status
        );
      }
      await removePlaceholderSessionData(db, userID);
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

  const handleDiscardSession = () => {
    if (isPending) {
      return null;
    }
    setDiscardModalVisible(true);
  };

  const handleConfirmDiscard = async () => {
    if (!user) {
      return;
    }
    try {
      setLoadingText(
        `${sessionIsLive ? 'Discarding' : 'Deleting'} this session...`,
      );
      const discardFunction = sessionIsLive
        ? discardLiveDrinkingSession
        : removeDrinkingSessionData;
      await waitForNoPendingUpdate();
      await discardFunction(db, user.uid, sessionId);
      await removePlaceholderSessionData(db, user.uid);
    } catch (error: any) {
      Alert.alert(
        'Session discard failed',
        'Could not discard the session: ' + error.message,
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
    if (!user) {
      return;
    }
    if (!sessionIsLive && hasSessionChanged()) {
      setShouldShowLeaveConfirmation(true); // Unsaved changes
      return;
    }
    if (sessionIsLive) {
      try {
        setLoadingText(translate('liveSessionScreen.synchronizing'));
        await waitForNoPendingUpdate();
        await updateSessionDrinks(db, user.uid, sessionId, session?.drinks);
      } catch (error: any) {
        Alert.alert('Database synchronization failed', error.message);
      } finally {
        setLoadingText('');
      }
    }
    await confirmGoBack();
  };

  const confirmGoBack = async () => {
    if (!user) {
      return;
    }
    try {
      if (isPlaceholderSession) {
        await removePlaceholderSessionData(db, user.uid);
      }
    } catch (error: any) {
      Log.warn('Could not remove placeholder session data', error.message); // Unimportant
    } finally {
      setShouldShowLeaveConfirmation(false);
      Navigation.goBack();
    }
  };

  const openSession = async () => {
    if (!user) {
      throw new Error(translate('liveSessionScreen.error.load'));
    }
    // Fetch the latest database data and use it to open the session
    setLoadingText(translate('liveSessionScreen.loading'));
    let sessionToOpen: DrinkingSession | null = await readDataOnce(
      db,
      DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID.getRoute(
        user.uid,
        sessionId,
      ),
    );
    if (!sessionToOpen) {
      // No drinking session with this ID => check for a placeholder session.
      const existingPlaceholderSession: DrinkingSession | null =
        await readDataOnce(
          db,
          DBPATHS.USER_SESSION_PLACEHOLDER_USER_ID.getRoute(user.uid),
        );
      if (!existingPlaceholderSession) {
        Alert.alert('Database Error', 'Failed to start a new session');
        Navigation.navigate(ROUTES.HOME);
        return;
      }
      sessionToOpen = existingPlaceholderSession;
      setIsPlaceholderSession(true);
    }
    setSession(sessionToOpen);
    initialSession.current = sessionToOpen;
    setOpeningSession(false);
    setLoadingText('');
  };

  // Prepare the session for the user upon component mount
  useFocusEffect(
    React.useCallback(() => {
      openSession();
    }, []),
  );

  // Monitor various dynamic attributes stemming from the session
  useEffect(() => {
    setSessionIsLive(!!session?.ongoing);
  }, [session?.ongoing]);

  // Synchronize the session with database
  useEffect(() => {
    // Only schedule a database update if any hooks changed
    // Do not automatically save if the session is over, or
    // if the initial fetch has not finished
    if (
      !user ||
      !sessionIsLive ||
      !session ||
      sessionFinished ||
      openingSession
    ) {
      return;
    }
    enqueueUpdate({...session, ongoing: true});
  }, [session, openingSession]);

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

  if (!isOnline) {
    return <UserOffline />;
  }
  if (openingSession || loadingText) {
    return <FullScreenLoadingIndicator loadingText={loadingText} />;
  }
  if (!user) {
    Navigation.navigate(ROUTES.INITIAL);
    return;
  }
  if (!session) {
    Navigation.navigate(ROUTES.HOME); // If a session fails to load
    return;
  }
  if (!preferences) {
    return;
  }

  return (
    <ScreenWrapper testID={LiveSessionScreen.displayName}>
      <HeaderWithBackButton
        onBackButtonPress={handleBackPress}
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
                ? `Session from ${sessionStartTime}`
                : `Session on ${sessionDateString}`}
            </Text>
          </View>
          {isPending && (
            <ActivityIndicator
              size="small"
              color="#0000ff"
              style={localStyles.isPendingIndicator}
            />
          )}
          <SuccessIndicator
            visible={dbSyncSuccessful}
            successStyle={[
              localStyles.successStyle,
              commonStyles.successIndicator,
            ]}
          />
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
            <View style={localStyles.drinkTypesContainer}>
              <DrinkTypesView
                drinkData={DrinkData}
                currentDrinks={session.drinks}
                setCurrentDrinks={setCurrentDrinks}
                availableUnits={availableUnits}
              />
            </View>
            <SessionDetailsSlider
              sessionId={sessionId}
              isBlackout={session.blackout}
              onBlackoutChange={handleBlackoutChange}
              note={session.note}
              dateString={sessionDateString}
              shouldAllowDateChange={session.type !== CONST.SESSION_TYPES.LIVE}
            />
          </>
        )}
        <FillerView />
      </ScrollView>
      <View style={styles.bottomTabBarContainer(true)}>
        <Button
          success
          text={`${deleteSessionWording} Session`}
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
          text="Save Session"
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
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  isPendingIndicator: {
    width: 25,
    height: 25,
    margin: 4,
    position: 'absolute',
    right: 0,
  },
  successStyle: {
    position: 'absolute',
    right: 0,
  },
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
  drinkTypesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  drinksInputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinksInputButton: {
    width: '40%',
    alignItems: 'center',
  },
  drinksInputText: {
    fontSize: 90,
    fontWeight: 'bold',
    // marginTop: 5,
    marginBottom: 10,
    alignSelf: 'center',
    alignContent: 'center',
    padding: 2,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 9,
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
  sessionDetailsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
});

LiveSessionScreen.displayName = 'Live Session Screen';
export default LiveSessionScreen;
