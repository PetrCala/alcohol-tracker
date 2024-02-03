import React, {useState, useEffect, useMemo, useReducer} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import SessionsCalendar from '../components/Calendar';
import LoadingData from '../components/LoadingData';
import {DrinkingSessionArrayItem} from '../types/database';
import {MainScreenProps} from '../types/screens';
import {DateObject} from '../types/components';
import {auth} from '../services/firebaseSetup';
import {
  dateToDateObject,
  calculateThisMonthUnits,
  findOngoingSession,
  calculateThisMonthPoints,
  getSingleMonthDrinkingSessions,
  timestampToDate,
  getYearMonthVerbose,
} from '../utils/dataHandling';
import {useUserConnection} from '../context/UserConnectionContext';
import UserOffline from '../components/UserOffline';
import {updateUserLastOnline} from '../database/users';
import {startLiveDrinkingSession} from '../database/drinkingSessions';
import {getDatabaseData} from '../context/DatabaseDataContext';
import commonStyles from '../styles/commonStyles';
import {useFirebase} from '../context/FirebaseContext';
import ProfileImage from '../components/ProfileImage';
import {generateDatabaseKey} from '@database/baseFunctions';

interface State {
  visibleDateObject: DateObject;
  drinkingSessionsCount: number;
  unitsConsumed: number;
  pointsEarned: number;
  ongoingSession: DrinkingSessionArrayItem | null;
  loadingNewSession: boolean;
  refreshing: boolean;
  refreshCounter: number;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  visibleDateObject: dateToDateObject(new Date()),
  drinkingSessionsCount: 0,
  unitsConsumed: 0,
  pointsEarned: 0,
  ongoingSession: null,
  loadingNewSession: false,
  refreshing: false,
  refreshCounter: 0,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_VISIBLE_DATE_OBJECT':
      return {...state, visibleDateObject: action.payload};
    case 'SET_DRINKING_SESSIONS_COUNT':
      return {...state, drinkingSessionsCount: action.payload};
    case 'SET_UNITS_CONSUMED':
      return {...state, unitsConsumed: action.payload};
    case 'SET_POINTS_EARNED':
      return {...state, pointsEarned: action.payload};
    case 'SET_ONGOING_SESSION':
      return {...state, ongoingSession: action.payload};
    case 'SET_LOADING_NEW_SESSION':
      return {...state, loadingNewSession: action.payload};
    case 'SET_REFRESHING':
      return {...state, refreshing: action.payload};
    case 'SET_REFRESH_COUNTER':
      return {...state, refreshCounter: action.payload};
    default:
      return state;
  }
};

// const [startSessionModalVisible, setStartSessionModalVisible] =
//   useState<boolean>(false);

const MainScreen = ({navigation}: MainScreenProps) => {
  const user = auth.currentUser;
  const {db, storage} = useFirebase();
  const {isOnline} = useUserConnection();
  const {
    currentSessionData,
    drinkingSessionData,
    drinkingSessionKeys,
    preferences,
    unconfirmedDays,
    userData,
    isLoading,
  } = getDatabaseData();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Handle drinking session button press
  const startDrinkingSession = async () => {
    if (!preferences || !db || !user) return null; // Should never be null
    let sessionData: DrinkingSessionArrayItem;
    let sessionKey: string;
    if (!state.ongoingSession) {
      dispatch({type: 'SET_LOADING_NEW_SESSION', payload: true});
      // The user is not in an active session
      sessionData = {
        start_time: Date.now(),
        end_time: Date.now(), // Will be overwritten
        blackout: false,
        note: '',
        units: {
          [Date.now()]: {other: 0}, // Necessary placeholder, will be deleted
        },
        ongoing: true,
      };
      const newSessionKey = generateDatabaseKey(
        db,
        `user_drinking_sessions/${user.uid}`,
      );
      if (!newSessionKey) {
        Alert.alert(
          'New session key generation failed',
          "Couldn't generate a new session key",
        );
        return;
      }
      sessionKey = newSessionKey;
      try {
        await startLiveDrinkingSession(db, user.uid, sessionData, sessionKey);
      } catch (error: any) {
        Alert.alert(
          'New session initialization failed',
          'Could not start a new session: ' + error.message,
        );
        return;
      }
    } else {
      const currentsessionKey = currentSessionData?.current_session_id ?? null;
      if (!currentsessionKey) {
        Alert.alert(
          'New session initialization failed',
          'Could not find the existing session',
        );
        return;
      }
      sessionData = state.ongoingSession;
      sessionKey = currentsessionKey;
    }
    navigation.navigate('Drinking Session Screen', {
      session: sessionData,
      sessionKey: sessionKey,
      preferences: preferences,
    });
    dispatch({type: 'SET_LOADING_NEW_SESSION', payload: false});
  };

  const onRefresh = React.useCallback(() => {
    dispatch({type: 'SET_REFRESHING', payload: true});
    setTimeout(() => {
      dispatch({type: 'SET_REFRESHING', payload: false});
      dispatch({
        type: 'SET_REFRESH_COUNTER',
        payload: state.refreshCounter + 1,
      });
    }, 1000);
  }, []);

  // Update the user last login time
  useEffect(() => {
    const fetchData = async () => {
      if (!db || !user) return;
      try {
        await updateUserLastOnline(db, user.uid);
      } catch (error: any) {
        Alert.alert(
          'Failed to contact the database',
          'Could not update user online status:' + error.message,
        );
      }
    };

    fetchData();
  }, []);

  // Monitor ongoing sessions in database
  useMemo(() => {
    let result = findOngoingSession(drinkingSessionData);
    dispatch({type: 'SET_ONGOING_SESSION', payload: result});
  }, [drinkingSessionData, currentSessionData]);

  // Monitor visible month and various statistics
  useMemo(() => {
    if (!preferences) return;
    let thisMonthUnits = calculateThisMonthUnits(
      state.visibleDateObject,
      drinkingSessionData,
    );
    let thisMonthPoints = calculateThisMonthPoints(
      state.visibleDateObject,
      drinkingSessionData,
      preferences.units_to_points,
    );
    let thisMonthSessionCount = getSingleMonthDrinkingSessions(
      timestampToDate(state.visibleDateObject.timestamp),
      drinkingSessionData,
      false,
    ).length; // Replace this in the future

    dispatch({
      type: 'SET_DRINKING_SESSIONS_COUNT',
      payload: thisMonthSessionCount,
    });
    dispatch({type: 'SET_UNITS_CONSUMED', payload: thisMonthUnits});
    dispatch({type: 'SET_POINTS_EARNED', payload: thisMonthPoints});
  }, [drinkingSessionData, state.visibleDateObject, preferences]);

  if (!user) {
    navigation.replace('Auth', {screen: 'Login Screen'});
    return;
  }
  if (!isOnline) return <UserOffline />;
  if (isLoading || state.loadingNewSession)
    return (
      <LoadingData
        loadingText={state.loadingNewSession ? 'Starting a new session...' : ''}
      />
    );
  if (!db || !preferences || !drinkingSessionData || !userData) return;

  return (
    <>
      <View style={commonStyles.headerContainer}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Profile Screen', {
                userId: user.uid,
                profileData: userData.profile,
                friends: userData.friends,
                currentUserFriends: userData.friends,
                drinkingSessionData: drinkingSessionData,
                preferences: preferences,
              })
            }
            style={styles.profileButton}>
            <ProfileImage
              storage={storage}
              userId={user.uid}
              downloadPath={userData.profile.photo_url}
              style={styles.profileImage}
              refreshTrigger={state.refreshCounter}
            />
            <Text style={styles.headerUsername}>{user.displayName}</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.menuContainer}>
              <Text style={styles.yearMonthText}>{thisYearMonth}</Text>
          </View> */}
      </View>
      {state.ongoingSession ? (
        <TouchableOpacity
          style={styles.userInSessionWarningContainer}
          onPress={startDrinkingSession}>
          <Text style={styles.userInSessionWarningText}>
            You are currently in session!
          </Text>
        </TouchableOpacity>
      ) : null}
      {/* <View style={styles.yearMonthContainer}>
        <Text style={styles.yearMonthText}>{thisYearMonth}</Text>
      </View> */}
      <ScrollView
        style={styles.mainScreenContent}
        refreshControl={
          <RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.menuInfoContainer}>
          <View style={styles.menuInfoItemContainer}>
            <Text style={styles.menuInfoText}>Units:</Text>
            <Text style={styles.menuInfoText}>{state.unitsConsumed}</Text>
          </View>
          <View style={styles.menuInfoItemContainer}>
            <Text style={styles.menuInfoText}>Points:</Text>
            <Text style={styles.menuInfoText}>{state.pointsEarned}</Text>
          </View>
          <View style={styles.menuInfoItemContainer}>
            <Text style={styles.menuInfoText}>Sessions:</Text>
            <Text style={styles.menuInfoText}>
              {state.drinkingSessionsCount}
            </Text>
          </View>
        </View>
        <SessionsCalendar
          drinkingSessionData={drinkingSessionData}
          preferences={preferences}
          visibleDateObject={state.visibleDateObject}
          dispatch={dispatch}
          onDayPress={(day: DateObject) => {
            navigation.navigate('Day Overview Screen', {dateObject: day});
          }}
        />
        <View style={{height: 200, backgroundColor: '#ffff99'}}></View>
      </ScrollView>
      <View style={commonStyles.mainFooter}>
        <View
          style={[
            styles.mainScreenFooterHalfContainer,
            styles.mainScreenFooterLeftContainer,
          ]}>
          <MenuIcon
            iconId="social-icon"
            iconSource={require('../../assets/icons/social.png')}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() =>
              navigation.navigate('Social Screen', {screen: 'Friend List'})
            }
          />
          <MenuIcon
            iconId="achievement-icon"
            iconSource={require('../../assets/icons/achievements.png')}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() => navigation.navigate('Achievement Screen')}
          />
        </View>
        <View
          style={[
            styles.mainScreenFooterHalfContainer,
            styles.mainScreenFooterRightContainer,
          ]}>
          <MenuIcon
            iconId="main-menu-popup-icon"
            iconSource={require('../../assets/icons/statistics.png')}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() => navigation.navigate('Statistics Screen')}
          />
          <MenuIcon
            iconId="main-menu-popup-icon"
            iconSource={require('../../assets/icons/bar_menu.png')}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() =>
              navigation.navigate('Main Menu Screen', {
                userData: userData,
                preferences: preferences,
              })
            }
          />
        </View>
      </View>
      {state.ongoingSession ? null : (
        <TouchableOpacity
          style={styles.startSessionButton}
          onPress={startDrinkingSession}>
          <Image
            source={require('../../assets/icons/plus.png')}
            style={styles.startSessionImage}
          />
        </TouchableOpacity>
      )}
    </>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  profileContainer: {
    //Ensure the container fills all space between, no more, no less
    padding: 10,
    flexGrow: 1,
    flexShrink: 1,
  },
  profileButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerUsername: {
    flexWrap: 'wrap',
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
    marginLeft: 10,
    alignSelf: 'center',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 200,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
    padding: 10,
  },
  yearMonthContainer: {
    width: '100%',
    backgroundColor: '#ffff99',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  yearMonthText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
  },
  mainScreenContent: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  ///
  userInSessionWarningContainer: {
    backgroundColor: '#ff5d54',
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
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInSessionWarningText: {
    fontSize: 22,
    color: '#ffffff', // White color for the text
    fontWeight: 'bold',
  },
  menuInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#FFFF99',
    width: '100%',
  },
  menuInfoItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFF99',
    width: '100%',
  },
  menuInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
    // alignContent: "center",
    padding: 6,
    marginRight: 4,
    marginLeft: 4,
  },
  thisMonthUnitsText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'black',
    alignSelf: 'center',
    alignContent: 'center',
  },
  startSessionButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{translateX: -35}],
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
  },
  startSessionImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
    alignItems: 'center',
    // color: 'white',
    // fontSize: 50,
    // fontWeight: 'bold',
    // textAlign: 'center',
    // lineHeight: 70,
  },
  navigationArrowContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#ffff99',
    flexDirection: 'row',
  },
  navigationArrowButton: {
    width: '50%',
    height: 45,
    alignSelf: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  navigationArrowText: {
    color: 'black',
    fontSize: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  mainScreenFooterHalfContainer: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'shite',
  },
  mainScreenFooterLeftContainer: {
    paddingRight: 30,
  },
  mainScreenFooterRightContainer: {
    paddingLeft: 30,
  },
});
