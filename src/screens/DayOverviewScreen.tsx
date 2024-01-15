import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  Image,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MenuIcon from '../components/Buttons/MenuIcon';
import {
  timestampToDate,
  formatDateToDay,
  formatDateToTime,
  changeDateBySomeDays,
  unitsToColors,
  getSingleDayDrinkingSessions,
  setDateToCurrentTime,
  sumAllUnits,
  getZeroUnitsObject,
  sumAllPoints,
} from '../utils/dataHandling';
import {useContext} from 'react';
import LoadingData from '../components/LoadingData';
import {
  DrinkingSessionProps,
  DrinkingSessionData,
  DrinkingSessionArrayItem,
  PreferencesData,
} from '../types/database';
import {DayOverviewScreenProps} from '../types/screens';
import {auth} from '../services/firebaseSetup';
import UserOffline from '../components/UserOffline';
import {useUserConnection} from '../context/UserConnectionContext';
import BasicButton from '../components/Buttons/BasicButton';
import {getDatabaseData} from '../context/DatabaseDataContext';
import CONST from '@src/CONST';

type CombinedDataProps = {
  sessionKey: string;
  session: DrinkingSessionArrayItem;
};
import commonStyles from '../styles/commonStyles';
import { generateDatabaseKey } from '@database/baseFunctions';
import { useFirebase } from '@src/context/FirebaseContext';

const DayOverviewScreen = ({route, navigation}: DayOverviewScreenProps) => {
  if (!route || !navigation) return null; // Should never be null
  const {dateObject} = route.params; // Params for navigation
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {db} = useFirebase();
  const {drinkingSessionData, drinkingSessionKeys, preferences} =
    getDatabaseData();
  const [date, setDate] = useState<Date>(timestampToDate(dateObject.timestamp));
  const [dailySessionData, setDailyData] = useState<DrinkingSessionArrayItem[]>(
    [],
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  // Create a combined data object
  const [combinedData, setCombinedData] = useState<CombinedDataProps[]>([]);

  // Monitor the daily sessions data
  useEffect(() => {
    let newSessions = getSingleDayDrinkingSessions(date, drinkingSessionData);
    setDailyData(newSessions);
  }, [date, drinkingSessionData]);

  // Monitor the combined data
  useEffect(() => {
    let newCombinedData = dailySessionData.map((session): CombinedDataProps => {
      return {
        sessionKey: drinkingSessionKeys[drinkingSessionData.indexOf(session)],
        session: session,
      };
    });
    setCombinedData(newCombinedData);
  }, [dailySessionData]);

  const onSessionButtonPress = (
    sessionKey: string,
    session: DrinkingSessionArrayItem,
    preferences: PreferencesData,
  ) => {
    if (!preferences) return null;
    let navigateToScreen: string = session?.ongoing
      ? 'Drinking Session Screen'
      : 'Session Summary Screen';
    navigation.navigate(navigateToScreen, {
      session: session,
      sessionKey: sessionKey,
      preferences: preferences,
    });
  };

  const onEditSessionPress = (
    session: DrinkingSessionArrayItem,
    sessionKey: string,
  ) => {
    navigation.navigate('Edit Session Screen', {
      session: session,
      sessionKey: sessionKey,
    });
  };

  const DrinkingSession = ({sessionKey, session}: DrinkingSessionProps) => {
    if (!preferences) return;
    // Calculate the session color
    var totalUnits = sumAllUnits(session.units);
    var totalPoints = sumAllPoints(session.units, preferences.units_to_points);
    var unitsToColorsInfo = preferences.units_to_colors;
    var sessionColor = unitsToColors(totalPoints, unitsToColorsInfo);
    if (session.blackout === true) {
      sessionColor = 'black';
    }
    // Convert the timestamp to a Date object
    const date = timestampToDate(session.start_time);
    const viewStyle = {
      ...styles.menuDrinkingSessionContainer,
      backgroundColor: sessionColor,
    };

    return (
      <View style={viewStyle}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 1}}>
            <TouchableOpacity
              style={styles.menuDrinkingSessionButton}
              onPress={() =>
                onSessionButtonPress(sessionKey, session, preferences)
              }>
              <Text
                style={[
                  styles.menuDrinkingSessionText,
                  session.blackout === true ? {color: 'white'} : {},
                ]}>
                Time: {formatDateToTime(date)}
              </Text>
              <Text
                style={[
                  styles.menuDrinkingSessionText,
                  session.blackout === true ? {color: 'white'} : {},
                ]}>
                Units: {totalUnits}
              </Text>
              <Text
                style={[
                  styles.menuDrinkingSessionText,
                  session.blackout === true ? {color: 'white'} : {},
                ]}>
                Points: {totalPoints}
              </Text>
            </TouchableOpacity>
          </View>
          {session?.ongoing ? (
            <View style={styles.ongoingSessionContainer}>
              <TouchableOpacity
                style={styles.ongoingSessionButton}
                onPress={() =>
                  onSessionButtonPress(sessionKey, session, preferences)
                }>
                <Text style={styles.ongoingSessionText}>In Session</Text>
              </TouchableOpacity>
            </View>
          ) : editMode ? (
            <MenuIcon
              iconId="edit-session-icon"
              iconSource={require('../../assets/icons/edit.png')}
              containerStyle={[
                styles.menuIconContainer,
                session.blackout === true ? {backgroundColor: 'white'} : {},
              ]}
              iconStyle={styles.menuIcon}
              onPress={() => onEditSessionPress(session, sessionKey)} // Use keyextractor to load id here
            />
          ) : (
            <></>
          )}
        </View>
      </View>
    );
  };

  const renderDrinkingSession = ({item}: {item: CombinedDataProps}) => {
    return (
      <DrinkingSession sessionKey={item.sessionKey} session={item.session} />
    );
  };

  const noDrinkingSessionsComponent = () => {
    return (
      <Text style={styles.menuDrinkingSessionInfoText}>
        No drinking sessions
      </Text>
    );
  };

  const addSessionButton = () => {
    if (date == null) {
      return <LoadingData loadingText="" />;
    }
    if (!editMode || !user) return <></>; // Do not display outside edit mode
    // No button if the date is in the future
    let today = new Date();
    let tomorrowMidnight = changeDateBySomeDays(today, 1);
    tomorrowMidnight.setHours(0, 0, 0, 0);
    if (date >= tomorrowMidnight) {
      return <></>;
    }
    // Create a new mock drinking session
    let newTimestamp = setDateToCurrentTime(date).getTime(); // At noon
    let newSession: DrinkingSessionArrayItem = {
      start_time: newTimestamp, // Arbitrary timestamp of today's noon
      end_time: newTimestamp,
      blackout: false,
      note: '',
      units: getZeroUnitsObject(),
    };
    let newSessionKey = generateDatabaseKey(db, `user_drinking_sessions/${user.uid}`);
    if (!newSessionKey) {
      Alert.alert('Error', 'Could not generate a new session key.');
      return;
    }
    return (
      <TouchableOpacity
        style={styles.addSessionButton}
        onPress={() =>
          navigation.navigate('Edit Session Screen', {
            session: newSession,
            sessionKey: newSessionKey,
          })
        }>
        <Image
          source={require('../../assets/icons/plus.png')}
          style={styles.addSessionImage}
        />
      </TouchableOpacity>
    );
  };

  /** Offset the "date" hook by a number of days.
   *
   * @param days Number of days to change the day by.
   */
  const changeDay = (days: number) => {
    if (date != null) {
      const newDate = changeDateBySomeDays(date, days);
      setDate(newDate);
    }
  };
  // useFocusEffect(
  //     useCallback(() => {
  //         let newSessions = getSingleDayDrinkingSessions(date, drinkingSessionData);
  //         setDailyData(newSessions);
  //         console.log(newSessions.length)
  //     }, [date, drinkingSessionData])
  // );

  if (!isOnline) return <UserOffline />;
  if (!date) return <LoadingData />;
  if (!user || !preferences) {
    navigation.replace('Login Screen');
    return;
  }

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId="escape-settings-screen"
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack()}
        />
        <BasicButton
          text={editMode ? 'Exit Edit Mode' : 'Edit Mode'}
          buttonStyle={[
            styles.editModeButton,
            editMode ? styles.editModeButtonEnabled : {},
          ]}
          textStyle={styles.editModeButtonText}
          onPress={() => setEditMode(!editMode)}
        />
      </View>
      <View style={styles.dayOverviewContainer}>
        <Text style={styles.menuDrinkingSessionInfoText}>
          {date ? formatDateToDay(date) : 'Loading date...'}
        </Text>
        {drinkingSessionData ? (
          <FlatList
            data={combinedData}
            renderItem={renderDrinkingSession}
            keyExtractor={item => String(item.sessionKey)} // Use start time as id
            ListEmptyComponent={noDrinkingSessionsComponent}
            ListFooterComponent={addSessionButton}
            ListFooterComponentStyle={styles.addSessionButtonContainer}
          />
        ) : (
          <></>
        )}
      </View>
      <View style={styles.dayOverviewFooter}>
        <MenuIcon
          iconId="navigate-day-back"
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.footerArrowContainer}
          iconStyle={[styles.dayArrowIcon, styles.previousDayArrow]}
          onPress={() => {
            changeDay(-1);
          }}
        />
        <MenuIcon
          iconId="navigate-day-forward"
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.footerArrowContainer}
          iconStyle={[styles.dayArrowIcon, styles.nextDayArrow]}
          onPress={() => {
            changeDay(1);
          }}
        />
      </View>
    </View>
  );
};

export default DayOverviewScreen;

const styles = StyleSheet.create({
  menuDrinkingSessionContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backArrowContainer: {
    justifyContent: 'center',
    padding: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  editModeContainer: {
    height: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFF99',
  },
  editModeButton: {
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fcf50f',
  },
  editModeButtonEnabled: {
    backgroundColor: '#FFFF99',
  },
  editModeButtonText: {
    color: 'black',
    fontSize: 17,
    fontWeight: '600',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 25,
    height: 25,
    padding: 10,
  },
  dayOverviewContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  menuDrinkingSessionButton: {
    flexGrow: 1,
    flexShrink: 1,
  },
  menuDrinkingSessionText: {
    fontSize: 16,
    color: 'black',
  },
  menuDrinkingSessionInfoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
    color: 'black',
    alignSelf: 'center',
    alignContent: 'center',
    padding: 10,
  },
  dayOverviewFooter: {
    flexShrink: 1, // Only as large as necessary
    marginHorizontal: -1,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFF99',
    shadowColor: '#000',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderRadius: 2,
    marginVertical: 0,
    borderColor: '#ddd',
    elevation: 8, // for Android shadow
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addSessionButton: {
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center', // Center the text within the button
  },
  addSessionImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
    alignItems: 'center',
  },
  addSessionButtonContainer: {
    padding: 10,
    alignSelf: 'center',
  },
  footerArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: CONST.SCREEN_WIDTH / 2,
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'grey',
    height: 50,
  },
  dayArrowIcon: {
    width: 25,
    height: 25,
    tintColor: 'black',
  },
  previousDayArrow: {
    alignSelf: 'flex-start',
    marginLeft: 15,
  },
  nextDayArrow: {
    transform: [{rotate: '180deg'}],
    alignSelf: 'flex-end',
    marginRight: 15,
  },
  ongoingSessionContainer: {
    width: 120,
    height: 40,
    borderRadius: 10,
    margin: 5,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  ongoingSessionButton: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ongoingSessionText: {
    color: 'black',
    fontWeight: '500',
    fontSize: 20,
  },
});
