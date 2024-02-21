import React, {useRef, useState, useContext, useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageSourcePropType,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';
import BasicButton from '../../components/Buttons/BasicButton';
import {useFirebase} from '../../context/global/FirebaseContext';
import {
  discardLiveDrinkingSession,
  endLiveDrinkingSession,
  saveDrinkingSessionData,
  updateSessionUnits,
} from '../../database/drinkingSessions';
import {
  addUnits,
  dateToDateObject,
  formatDateToDay,
  formatDateToTime,
  removeUnits,
  sumAllPoints,
  sumUnitsOfSingleType,
  timestampToDate,
  unitsToColors,
} from '../../libs/DataHandling';
import {DrinkingSession, UnitKey, Units, UnitsList} from '../../types/database';
import YesNoPopup from '../../components/Popups/YesNoPopup';
import {useUserConnection} from '../../context/global/UserConnectionContext';
import UserOffline from '../../components/UserOffline';
import UnitTypesView from '../../components/UnitTypesView';
import SessionDetailsSlider from '../../components/SessionDetailsSlider';
import LoadingData from '../../components/LoadingData';
import {usePrevious} from '../../hooks/usePrevious';
import SuccessIndicator from '../../components/SuccessIndicator';
import commonStyles from '../../styles/commonStyles';
import FillerView from '../../components/FillerView';
// import {getPreviousRouteName} from '@navigation/Navigation';
import CONST from '@src/CONST';
import MainHeader from '@components/Header/MainHeader';
import MainHeaderButton from '@components/Header/MainHeaderButton';
import DrinkDataProps from '@src/types/various/DrinkDataProps';
import Navigation from '@navigation/Navigation';

const LiveSessionScreen = ({route, navigation}: LiveSessionScreenProps) => {
  // Navigation
  if (!route || !navigation) return null; // Should never be null
  const {session, sessionKey, preferences} = route.params;
  // Context, database, and authentification
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  // Units
  const [currentUnits, setCurrentUnits] = useState<UnitsList>(session.units);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [availableUnits, setAvailableUnits] = useState<number>(0);
  // Hooks for immediate display info - update these manually to improve efficiency
  const [smallBeerSum, setSmallBeerSum] = useState<number>(
    sumUnitsOfSingleType(currentUnits, 'small_beer'),
  );
  const [beerSum, setBeerSum] = useState<number>(
    sumUnitsOfSingleType(currentUnits, 'beer'),
  );
  const [cocktailSum, setCocktailSum] = useState<number>(
    sumUnitsOfSingleType(currentUnits, 'cocktail'),
  );
  const [otherSum, setOtherSum] = useState<number>(
    sumUnitsOfSingleType(currentUnits, 'other'),
  );
  const [strongShotSum, setStrongShotSum] = useState<number>(
    sumUnitsOfSingleType(currentUnits, 'strong_shot'),
  );
  const [weakShotSum, setWeakShotSum] = useState<number>(
    sumUnitsOfSingleType(currentUnits, 'weak_shot'),
  );
  const [wineSum, setWineSum] = useState<number>(
    sumUnitsOfSingleType(currentUnits, 'wine'),
  );
  // Session details
  const [isBlackout, setIsBlackout] = useState<boolean>(session.blackout);
  const [note, setNote] = useState<string>(session.note);
  // Time info
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const updateTimeout = 1000; // Synchronize with DB every x milliseconds
  const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  const sessionDate = timestampToDate(session.start_time);
  const sessionDay = formatDateToDay(sessionDate);
  const sessionStartTime = formatDateToTime(sessionDate);
  // Other
  const [monkeMode, setMonkeMode] = useState<boolean>(false);
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);
  const [savingSession, setSavingSession] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null); // To navigate the view

  const drinkData: DrinkDataProps = [
    {
      key: 'small_beer',
      icon: KirokuIcons.Beer,
      typeSum: smallBeerSum,
      setTypeSum: setSmallBeerSum,
    },
    {
      key: 'beer',
      icon: KirokuIcons.Beer,
      typeSum: beerSum,
      setTypeSum: setBeerSum,
    },
    {
      key: 'wine',
      icon: KirokuIcons.Wine,
      typeSum: wineSum,
      setTypeSum: setWineSum,
    },
    {
      key: 'weak_shot',
      icon: KirokuIcons.WeakShot,
      typeSum: weakShotSum,
      setTypeSum: setWeakShotSum,
    },
    {
      key: 'strong_shot',
      icon: KirokuIcons.StrongShot,
      typeSum: strongShotSum,
      setTypeSum: setStrongShotSum,
    },
    {
      key: 'cocktail',
      icon: KirokuIcons.Cocktail,
      typeSum: cocktailSum,
      setTypeSum: setCocktailSum,
    },
    {
      key: 'other',
      icon: KirokuIcons.AlcoholAssortment,
      typeSum: otherSum,
      setTypeSum: setOtherSum,
    },
  ];

  const handleMonkePlus = () => {
    if (availableUnits > 0) {
      let unitsToAdd: Units = {other: 1};
      let newUnits: UnitsList = addUnits(currentUnits, unitsToAdd);
      setCurrentUnits(newUnits);
      setOtherSum(otherSum + 1);
    }
  };

  const handleMonkeMinus = () => {
    if (otherSum > 0) {
      let newUnits: UnitsList = removeUnits(currentUnits, 'other', 1);
      setCurrentUnits(newUnits);
      setOtherSum(otherSum - 1);
    }
    // Here, as else, maybe send an alert that there are other types of
    // units logged
  };

  const handleBlackoutChange = (value: boolean) => {
    setIsBlackout(value);
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
  };

  // Update the hooks whenever current units change
  useMemo(() => {
    if (!preferences) return;
    let newTotalPoints = sumAllPoints(
      currentUnits,
      preferences.units_to_points,
    );
    let newAvailableUnits = CONST.MAX_ALLOWED_UNITS - newTotalPoints;
    setTotalPoints(newTotalPoints);
    setAvailableUnits(newAvailableUnits);
  }, [currentUnits]);

  // Monitor changes on screen using a custom hook
  const prevUnits = usePrevious(currentUnits);
  const prevIsBlackout = usePrevious(isBlackout);
  const prevNote = usePrevious(note);

  // Change database value once every second
  useEffect(() => {
    if (!db || !user) return;
    // Compare previous values with current values
    const unitsChanged = prevUnits !== currentUnits;
    const blackoutChanged = prevIsBlackout !== isBlackout;
    const noteChanged = prevNote !== note;
    // Determine if any value has changed
    const anyValueChanged = unitsChanged || blackoutChanged || noteChanged;

    // Only schedule a database update if any hooks changed
    if (anyValueChanged) {
      setDbSyncSuccessful(false);
      setPendingUpdate(true);
      const timer = setTimeout(async () => {
        try {
          let newSessionData: DrinkingSession = {
            start_time: session.start_time,
            end_time: session.end_time,
            units: currentUnits,
            blackout: isBlackout,
            note: note,
            ongoing: true,
          };
          await saveDrinkingSessionData(
            db,
            user.uid,
            newSessionData,
            sessionKey,
            true, // Update live session status
          );
        } catch (error: any) {
          throw new Error('Could not save the drinking session data');
        } finally {
          setPendingUpdate(false); // Data has been synchronized with DB
          setLastUpdate(Date.now());
          setDbSyncSuccessful(true);
        }
      }, updateTimeout); // Update every x milliseconds
      // Clear timer on unmount or when units changes
      return () => clearTimeout(timer);
    }
  }, [currentUnits, isBlackout, note]);

  async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function waitForPendingUpdateToComplete(): Promise<boolean> {
    if (!pendingUpdate) {
      return false; // No waiting was needed
    }
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!pendingUpdate) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100); // Check every 100ms
    });
  }

  async function saveSession(db: any, userId: string) {
    if (totalPoints > 99) {
      console.log('Cannot save this session');
      return null;
    }
    if (!navigation) return null; // Should not happen
    // Wait for any pending updates to resolve first
    if (pendingUpdate) {
      console.log('Data synchronization ongoing');
      return null;
    }
    let timeSinceLastUpdate = Date.now() - lastUpdate;
    // Save the data into the database
    if (totalPoints > 0) {
      setSavingSession(true);
      let newSessionData: DrinkingSession = {
        start_time: session.start_time,
        end_time: Date.now(),
        units: currentUnits,
        blackout: isBlackout,
        note: note,
      };
      try {
        if (timeSinceLastUpdate < 1000) {
          await sleep(1000 - timeSinceLastUpdate); // Wait for database synchronization
        }
        await endLiveDrinkingSession(db, userId, newSessionData, sessionKey);
      } catch (error: any) {
        Alert.alert(
          'Session save failed',
          'Failed to save drinking session data: ' + error.message,
        );
        return;
      }
      // Reroute to session summary, do not allow user to return
      navigation.replace('Session Summary Screen', {
        session: newSessionData,
        sessionKey: sessionKey,
      });
      setSavingSession(false);
    }
  }

  const handleDiscardSession = () => {
    if (pendingUpdate) return null;
    setDiscardModalVisible(true);
  };

  const handleConfirmDiscard = async () => {
    if (!db || !user) return;
    let timeSinceLastUpdate = Date.now() - lastUpdate;
    if (timeSinceLastUpdate < 1000) {
      await sleep(1000 - timeSinceLastUpdate); // Wait for database synchronization
    }
    try {
      await discardLiveDrinkingSession(db, user.uid, sessionKey);
    } catch (error: any) {
      Alert.alert(
        'Session discard failed',
        'Could not discard the session: ' + error.message,
      );
    } finally {
      setDiscardModalVisible(false);
      const previousRouteName = Navigation.getPreviousRouteName(navigation);
      if (previousRouteName.includes('Day Overview Screen')) {
        const sessionDateObject = dateToDateObject(sessionDate);
        navigation.navigate('Day Overview Screen', {
          dateObject: sessionDateObject,
        });
      } else {
        navigation.navigate('Home Screen');
      }
    }
  };

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (!db || !user) return;
    if (pendingUpdate) {
      try {
        await updateSessionUnits(db, user.uid, sessionKey, currentUnits);
      } catch (error: any) {
        Alert.alert('Database synchronization failed', error.message);
      }
    }
    // navigation.navigate("Main Screen");
    navigation.goBack();
  };

  if (!isOnline) return <UserOffline />;
  if (savingSession) return <LoadingData loadingText="Saving session..." />;
  if (user == null) {
    navigation.replace('Login Screen');
    return null;
  }
  if (!db) return null; // Should never be null

  const sessionColor = unitsToColors(totalPoints, preferences.units_to_colors);

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
          {pendingUpdate && (
            <ActivityIndicator
              size="small"
              color="#0000ff"
              style={styles.pendingUpdateIndicator}
            />
          )}
          <SuccessIndicator
            visible={dbSyncSuccessful}
            successStyle={[styles.successStyle, commonStyles.successIndicator]}
          />
        </View>
        <View style={styles.unitCountContainer}>
          <Text style={[styles.unitCountText, {color: sessionColor}]}>
            {totalPoints}
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
            <View style={styles.unitTypesContainer}>
              <UnitTypesView
                drinkData={drinkData}
                currentUnits={currentUnits}
                setCurrentUnits={setCurrentUnits}
                availableUnits={availableUnits}
              />
            </View>
            <SessionDetailsSlider
              scrollViewRef={scrollViewRef}
              isBlackout={isBlackout}
              onBlackoutChange={handleBlackoutChange}
              note={note}
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
            pendingUpdate
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
            pendingUpdate
              ? styles.disabledSaveSessionButton
              : styles.enabledSaveSessionButton,
          ]}
          textStyle={styles.saveSessionButtonText}
          onPress={() => saveSession(db, user.uid)}
        />
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
  pendingUpdateIndicator: {
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
  unitTypesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  unitsInputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitsInputButton: {
    width: '40%',
    alignItems: 'center',
  },
  unitsInputText: {
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

export default LiveSessionScreen;
