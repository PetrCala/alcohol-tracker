import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  Alert,
  BackHandler,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import {EditSessionScreenProps} from '../types/screens';
import {DrinkingSession, Units, UnitsList} from '../types/database';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';
import {useFirebase} from '../context/global/FirebaseContext';
import {
  removeDrinkingSessionData,
  saveDrinkingSessionData,
} from '../database/drinkingSessions';
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
} from '../libs/DataHandling';

import YesNoPopup from '../components/Popups/YesNoPopup';
import {useUserConnection} from '../context/global/UserConnectionContext';
import UserOffline from '../components/UserOffline';
import UnitTypesView from '../components/UnitTypesView';
import SessionDetailsSlider from '../components/SessionDetailsSlider';
import {getDatabaseData} from '../context/global/DatabaseDataContext';
import CONST from '@src/CONST';
import MainHeader from '@components/Header/MainHeader';
import MainHeaderButton from '@components/Header/MainHeaderButton';
import {isEqual} from 'lodash';
import DrinkDataProps from '@src/types/various/DrinkDataProps';
import Navigation from '@libs/Navigation/Navigation';

const EditSessionScreen = ({route, navigation}: EditSessionScreenProps) => {
  if (!route || !navigation) return null; // Should never be null
  const {session, sessionKey} = route.params;
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {preferences} = getDatabaseData();
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
  const sessionDate = timestampToDate(session.start_time);
  const sessionDay = formatDateToDay(sessionDate);
  const sessionStartTime = formatDateToTime(sessionDate);
  const {db} = useFirebase();
  // Session object hooks
  const initialSession = useRef(session);
  const [currentSession, setCurrentSession] =
    useState<DrinkingSession>(session); // Track the session object modifications
  // Other
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [monkeMode, setMonkeMode] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
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

  const handleConfirmDelete = async () => {
    if (!user) return;
    try {
      await removeDrinkingSessionData(db, user.uid, sessionKey);
    } catch (error: any) {
      Alert.alert(
        'Failed to delete the session',
        'Session could not be deleted',
        error.message,
      );
      return;
    }
    setDeleteModalVisible(false);
    navigation.navigate('Day Overview Screen', {
      dateObject: dateToDateObject(sessionDate),
    });
  };

  const hasSessionChanged = () => {
    return !isEqual(initialSession.current, currentSession);
  };

  const handleBackPress = () => {
    if (hasSessionChanged()) {
      setShowLeaveConfirmation(true); // Unsaved changes
    } else {
      confirmGoBack(session); // No changes to the session object
    }
  };

  const confirmGoBack = (
    finalSessionData: DrinkingSession, // Decide which session to go back with
  ) => {
    const previousRouteName = Navigation.getPreviousRouteName(navigation);
    // Navigate back explicitly to avoid errors
    if (previousRouteName.includes('Day Overview Screen')) {
      const sessionDateObject = dateToDateObject(sessionDate);
      navigation.navigate('Day Overview Screen', {
        dateObject: sessionDateObject,
      });
    } else if (previousRouteName.includes('Session Summary Screen')) {
      navigation.navigate('Session Summary Screen', {
        session: finalSessionData,
        sessionKey: sessionKey,
      });
    } else {
      navigation.goBack();
    }
  };

  async function saveSession(db: any, userId: string) {
    if (totalPoints > 99) {
      console.log('cannot save this session');
      return null;
    }
    if (!navigation) {
      Alert.alert('Navigation not found', 'Failed to fetch the navigation');
      return null;
    }
    // Save the session
    if (totalPoints > 0) {
      let newSessionData: DrinkingSession = currentSession;
      // Handle old versions of drinking session data where note/blackout were missing - remove this later
      newSessionData.blackout = isBlackout ? isBlackout : false;
      newSessionData.note = note ? note : '';
      try {
        // Finish editing
        await saveDrinkingSessionData(
          db,
          userId,
          newSessionData,
          sessionKey,
          false, // Do not update live status
        );
      } catch (error: any) {
        Alert.alert(
          'Sesison edit failed',
          'Failed to edit the drinking session data: ' + error.message,
        );
        return;
      }
      confirmGoBack(newSessionData);
    }
  }

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

  useMemo(() => {
    if (!preferences) return;
    let newSession: DrinkingSession = {
      start_time: session.start_time,
      end_time: session.end_time,
      units: currentUnits,
      blackout: isBlackout,
      note: note,
    };
    setCurrentSession(newSession);
  }, [currentUnits, isBlackout, note]);

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
  }, [currentSession]); // Add your state dependencies here

  if (!isOnline) return <UserOffline />;
  if (!user || !preferences) {
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
          <Text style={styles.sessionInfoText}>Session date: {sessionDay}</Text>
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
        <View style={{height: 200, backgroundColor: '#ffff99'}}></View>
      </ScrollView>
      <View style={styles.saveSessionDelimiter} />
      <View style={styles.saveSessionContainer}>
        <BasicButton
          text="Delete Session"
          buttonStyle={styles.saveSessionButton}
          textStyle={styles.saveSessionButtonText}
          onPress={() => setDeleteModalVisible(true)}
        />
        <YesNoPopup
          visible={deleteModalVisible}
          transparent={true}
          message={'Do you really want to\ndelete this session?'}
          onRequestClose={() => setDeleteModalVisible(false)}
          onYes={handleConfirmDelete}
        />
        <BasicButton
          text="Save Session"
          buttonStyle={styles.saveSessionButton}
          textStyle={styles.saveSessionButtonText}
          onPress={() => saveSession(db, user.uid)}
        />
        <YesNoPopup
          visible={showLeaveConfirmation}
          transparent={true}
          onRequestClose={() => setShowLeaveConfirmation(false)}
          message="You have unsaved changes. Are you sure you want to go back?"
          onYes={() => confirmGoBack(session)} // No changes to the session object
        />
      </View>
    </>
  );
};

export default EditSessionScreen;

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
  sessionInfoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: 'black',
    alignSelf: 'center',
    alignContent: 'center',
    padding: 5,
  },
  sessionInfoContainer: {
    backgroundColor: '#FFFF99',
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
  saveSessionDelimiter: {
    height: 5,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#000',
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
    backgroundColor: '#fcf50f',
    borderWidth: 1,
    borderColor: '#000',
  },
  saveSessionButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
