import React, {useRef, useState, useContext, useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';
import BasicButton from '@components/Buttons/BasicButton';
import {useFirebase} from '@context/global/FirebaseContext';
import {
  discardLiveDrinkingSession,
  endLiveDrinkingSession,
  removeDrinkingSessionData,
  removePlaceholderSessionData,
  saveDrinkingSessionData,
  savePlaceholderSessionData,
  updateSessionDrinks,
} from '@database/drinkingSessions';
import {
  addDrinks,
  dateToDateObject,
  formatDateToDay,
  formatDateToTime,
  removeDrinks,
  sumAllUnits,
  sumDrinksOfSingleType,
  timestampToDate,
  timestampToDateString,
  unitsToColors,
} from '@libs/DataHandling';
import {
  DrinkingSession,
  DrinksList,
  DrinkKey,
  Drinks,
} from '@src/types/database';
import YesNoPopup from '@components/Popups/YesNoPopup';
import {useUserConnection} from '@context/global/UserConnectionContext';
import UserOffline from '@components/UserOffline';
import DrinkTypesView from '@components/DrinkTypesView';
import SessionDetailsSlider from '@components/SessionDetailsSlider';
import LoadingData from '@components/LoadingData';
import {usePrevious} from '@hooks/usePrevious';
import SuccessIndicator from '@components/SuccessIndicator';
import commonStyles from '@styles/commonStyles';
import FillerView from '@components/FillerView';
import CONST from '@src/CONST';
import MainHeader from '@components/Header/MainHeader';
import MainHeaderButton from '@components/Header/MainHeaderButton';
import DrinkDataProps from '@src/types/various/DrinkDataProps';
import Navigation from '@navigation/Navigation';
import {StackScreenProps} from '@react-navigation/stack';
import {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import {getEmptySession} from '@libs/SessionUtils';
import ROUTES from '@src/ROUTES';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {isEqual} from 'lodash';
import {readDataOnce} from '@database/baseFunctions';
import DBPATHS from '@database/DBPATHS';
import useAsyncQueue from '@hooks/useAsyncQueue';

type LiveSessionScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.LIVE
>;

const LiveSessionScreen = ({route}: LiveSessionScreenProps) => {
  const {sessionId} = route.params;
  // Context, database, and authentification
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {preferences} = useDatabaseData();
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const initialSession = useRef<DrinkingSession | null>(null);
  // Session details
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [availableUnits, setAvailableUnits] = useState<number>(0);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  // Time info
  const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  const sessionDate = timestampToDate(session?.start_time ?? Date.now());
  const sessionStartTime = formatDateToTime(sessionDate);
  const sessionColor = preferences
    ? unitsToColors(totalUnits, preferences.units_to_colors)
    : 'green';
  // Other
  const [monkeMode, setMonkeMode] = useState<boolean>(false);
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);
  const [openingSession, setOpeningSession] = useState<boolean>(true);
  const [savingSession, setSavingSession] = useState<boolean>(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const sessionIsLive = session?.ongoing ? true : false;
  const scrollViewRef = useRef<ScrollView>(null); // To navigate the view

  const {isPending, enqueueUpdate} = useAsyncQueue(
    async (newSession: DrinkingSession) => await syncWithDb(newSession),
  );

  const syncWithDb = async (newSessionData: DrinkingSession) => {
    if (!user || !session) return;
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
      console.log('Could not save the drinking session data', error.message);
      throw new Error('Could not save the drinking session data');
    }
  };

  const drinkData: DrinkDataProps = [
    {
      key: 'small_beer',
      icon: KirokuIcons.Beer,
    },
    {
      key: 'beer',
      icon: KirokuIcons.Beer,
    },
    {
      key: 'wine',
      icon: KirokuIcons.Wine,
    },
    {
      key: 'weak_shot',
      icon: KirokuIcons.WeakShot,
    },
    {
      key: 'strong_shot',
      icon: KirokuIcons.StrongShot,
    },
    {
      key: 'cocktail',
      icon: KirokuIcons.Cocktail,
    },
    {
      key: 'other',
      icon: KirokuIcons.AlcoholAssortment,
    },
  ];

  const hasSessionChanged = () => {
    return !isEqual(initialSession.current, session);
  };

  const handleMonkePlus = () => {
    if (!session) return;
    if (availableUnits > 0) {
      let drinksToAdd: Drinks = {other: 1};
      let newDrinks: DrinksList | undefined = addDrinks(
        session?.drinks,
        drinksToAdd,
      );
      setSession({...session, drinks: newDrinks});
    }
  };

  const handleMonkeMinus = () => {
    if (!session) return;
    if (sumDrinksOfSingleType(session.drinks, CONST.DRINKS.KEYS.OTHER) > 0) {
      let newDrinks: DrinksList | undefined = removeDrinks(
        session.drinks,
        'other',
        1,
      );
      setSession({...session, drinks: newDrinks});
    }
    // Here, as else, maybe send an alert that there are other types of
    // drinks logged
  };

  const handleBlackoutChange = (value: boolean) => {
    if (!session) return;
    setSession({...session, blackout: value});
  };

  const handleNoteChange = (value: string) => {
    if (!session) return;
    setSession({...session, note: value});
  };

  const setCurrentDrinks = (newDrinks: DrinksList | undefined) => {
    if (!session) return;
    setSession({...session, drinks: newDrinks});
  };

  // Function to wait for pending updates to finish
  const waitForNoPendingUpdate = async () => {
    while (isPending) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // Update the hooks whenever drinks change
  useMemo(() => {
    if (!preferences) return;
    let newTotalUnits = sumAllUnits(
      session?.drinks,
      preferences.drinks_to_units,
    );
    let newAvailableUnits = CONST.MAX_ALLOWED_UNITS - newTotalUnits;
    setTotalUnits(newTotalUnits);
    setAvailableUnits(newAvailableUnits);
  }, [session?.drinks]);

  async function saveSession(db: any, userId: string) {
    if (!session || !user) return;
    if (totalUnits > CONST.MAX_ALLOWED_UNITS) {
      console.log('Cannot save this session');
      return null;
    }
    if (totalUnits > 0) {
      try {
        setSavingSession(true);
        setSessionFinished(true); // No more db syncs
        let newSessionData: DrinkingSession = {
          ...session,
          end_time: sessionIsLive ? Date.now() : session.start_time,
        };
        delete newSessionData['ongoing'];
        // Wait for any pending updates to resolve first
        while (isPending) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (sessionIsLive) {
          await endLiveDrinkingSession(db, userId, newSessionData, sessionId);
        } else {
          await saveDrinkingSessionData(
            db,
            userId,
            newSessionData,
            sessionId,
            false, // Do not update live status
          );
        }
        await removePlaceholderSessionData(db, userId);
        // Reroute to session summary, do not allow user to return
        Navigation.navigate(
          ROUTES.DRINKING_SESSION_SUMMARY.getRoute(sessionId),
        );
      } catch (error: any) {
        Alert.alert(
          'Session save failed',
          'Failed to save drinking session data: ' + error.message,
        );
      } finally {
        setSavingSession(false);
      }
    }
  }

  const handleDiscardSession = () => {
    if (isPending) return null;
    setDiscardModalVisible(true);
  };

  const handleConfirmDiscard = async () => {
    if (!db || !user) return;
    try {
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
      setDiscardModalVisible(false);
      const previousScreenName = Navigation.getLastScreenName(true);
      if (previousScreenName == SCREENS.DAY_OVERVIEW.ROOT) {
        Navigation.navigate(
          ROUTES.DAY_OVERVIEW.getRoute(
            timestampToDateString(session?.start_time || Date.now()),
          ),
        );
      } else {
        Navigation.navigate(ROUTES.HOME);
      }
    }
  };

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (!user) return;
    if (!sessionIsLive && hasSessionChanged()) {
      setShowLeaveConfirmation(true); // Unsaved changes
      return;
    }
    if (sessionIsLive) {
      try {
        await waitForNoPendingUpdate();
        await updateSessionDrinks(db, user.uid, sessionId, session?.drinks);
      } catch (error: any) {
        Alert.alert('Database synchronization failed', error.message);
      }
    }
    confirmGoBack();
  };

  const confirmGoBack = () => {
    setShowLeaveConfirmation(false);
    Navigation.goBack();
  };

  const openSession = async () => {
    if (!user) return;
    // Fetch the latest database data and use it to open the session
    let sessionToOpen: DrinkingSession | null = await readDataOnce(
      db,
      DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID.getRoute(
        user.uid,
        sessionId,
      ),
    );
    if (!sessionToOpen) {
      // No drinking session with this ID => check for a placeholder session.
      let existingPlaceholderSession: DrinkingSession | null =
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
    }
    setSession(sessionToOpen);
    initialSession.current = sessionToOpen;
    setOpeningSession(false);
  };

  // Prepare the session for the user upon component mount
  useEffect(() => {
    openSession();
  }, []);

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
    )
      return;
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

  if (!isOnline) return <UserOffline />;
  if (openingSession)
    return <LoadingData loadingText="Opening your session..." />;
  if (savingSession)
    return <LoadingData loadingText="Saving your session..." />;
  if (!user) {
    Navigation.navigate(ROUTES.LOGIN);
    return;
  }
  if (!session) {
    Navigation.navigate(ROUTES.HOME); // If a session fails to load
    return;
  }
  if (!preferences) return;

  return (
    <>
      <MainHeader
        headerText=""
        onGoBack={handleBackPress}
        rightSideComponent={
          <MainHeaderButton
            buttonOn={monkeMode}
            textOn="Exit Monke Mode"
            textOff="Monke Mode"
            onPress={() => setMonkeMode(!monkeMode)}
          />
        }
      />
      <ScrollView
        style={styles.scrollView}
        ref={scrollViewRef}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled">
        <View style={styles.sessionInfoContainer}>
          <View style={styles.sessionTextContainer}>
            <Text style={styles.sessionInfoText}>
              Session started at {sessionStartTime}
            </Text>
          </View>
          {isPending && (
            <ActivityIndicator
              size="small"
              color="#0000ff"
              style={styles.isPendingIndicator}
            />
          )}
          <SuccessIndicator
            visible={dbSyncSuccessful}
            successStyle={[styles.successStyle, commonStyles.successIndicator]}
          />
        </View>
        <View style={styles.unitCountContainer}>
          <Text style={[styles.unitCountText, {color: sessionColor}]}>
            {totalUnits}
          </Text>
        </View>
        {monkeMode ? (
          <View style={styles.modifyUnitsContainer}>
            <TouchableOpacity
              style={[styles.modifyUnitsButton, {backgroundColor: 'red'}]}
              onPress={() => handleMonkeMinus()}>
              <Text style={styles.modifyUnitsText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modifyUnitsButton, {backgroundColor: 'green'}]}
              onPress={() => handleMonkePlus()}>
              <Text style={styles.modifyUnitsText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.drinkTypesContainer}>
              <DrinkTypesView
                drinkData={drinkData}
                currentDrinks={session.drinks}
                setCurrentDrinks={setCurrentDrinks}
                availableUnits={availableUnits}
              />
            </View>
            <SessionDetailsSlider
              scrollViewRef={scrollViewRef}
              isBlackout={session.blackout}
              onBlackoutChange={handleBlackoutChange}
              note={session.note}
              onNoteChange={handleNoteChange}
            />
          </>
        )}
        <FillerView />
      </ScrollView>
      <View style={styles.saveSessionDelimiter} />
      <View style={styles.saveSessionContainer}>
        <BasicButton
          text="Discard Session"
          buttonStyle={[
            styles.saveSessionButton,
            isPending
              ? styles.disabledSaveSessionButton
              : styles.enabledSaveSessionButton,
          ]}
          textStyle={styles.saveSessionButtonText}
          onPress={handleDiscardSession}
        />
        <YesNoPopup
          visible={discardModalVisible}
          transparent={true}
          onRequestClose={() => setDiscardModalVisible(false)}
          message={'Do you really want to\ndiscard this session?'}
          onYes={handleConfirmDiscard}
        />
        <BasicButton
          text="Save Session"
          buttonStyle={[
            styles.saveSessionButton,
            isPending
              ? styles.disabledSaveSessionButton
              : styles.enabledSaveSessionButton,
          ]}
          textStyle={styles.saveSessionButtonText}
          onPress={() => saveSession(db, user.uid)}
        />
        <YesNoPopup
          visible={showLeaveConfirmation}
          transparent={true}
          onRequestClose={() => setShowLeaveConfirmation(false)}
          message="You have unsaved changes. Are you sure you want to go back?"
          onYes={() => confirmGoBack()} // No changes to the session object
        />
        {/* <AsyncResponsiveComponent
          trigger={isPending}
          asyncOperation={asyncOperation}
        /> */}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backArrowContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  sessionInfoContainer: {
    backgroundColor: '#FFFF99',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sessionTextContainer: {
    alignItems: 'center',
  },
  sessionInfoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: 'black',
    alignSelf: 'center',
    alignContent: 'center',
    padding: 5,
  },
  isPendingIndicator: {
    width: 25,
    height: 25,
    margin: 10,
    position: 'absolute',
    right: 0,
  },
  successStyle: {
    position: 'absolute',
    right: 0,
  },
  unitCountContainer: {
    backgroundColor: '#FFFF99',
  },
  unitCountText: {
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
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFF99',
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
  modifyUnitsText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  sessionDetailsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  saveSessionDelimiter: {
    width: 0,
    // height: 5,
    // width: '100%',
    // backgroundColor: 'white',
    // borderTopWidth: 1,
    // borderColor: '#000',
  },
  saveSessionContainer: {
    height: '8%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFF99',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 10, // for Android shadow
  },
  saveSessionButton: {
    width: '50%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  enabledSaveSessionButton: {
    backgroundColor: '#fcf50f',
  },
  disabledSaveSessionButton: {
    backgroundColor: '#fffb82',
  },
  saveSessionButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

LiveSessionScreen.displayName = 'Live Session Screen';
export default LiveSessionScreen;
