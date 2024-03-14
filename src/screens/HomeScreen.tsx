import React, {useEffect, useMemo, useReducer} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '@components/Buttons/MenuIcon';
import SessionsCalendar from '@components/Calendar';
import LoadingData from '@components/LoadingData';
import {DateObject} from '@src/types/time';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';
import {
  dateToDateObject,
  calculateThisMonthUnits,
  calculateThisMonthPoints,
  getSingleMonthDrinkingSessions,
  timestampToDate,
  formatDate,
  timestampToDateString,
} from '@libs/DataHandling';
import {useUserConnection} from '@context/global/UserConnectionContext';
import UserOffline from '@components/UserOffline';
import {updateUserLastOnline} from '@database/users';
import {startLiveDrinkingSession} from '@database/drinkingSessions';
import commonStyles from '@src/styles/commonStyles';
import {useFirebase} from '@context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import {generateDatabaseKey} from '@database/baseFunctions';
import CONST from '@src/CONST';
import {
  DrinkingSession,
  DrinkingSessionArray,
  DrinkingSessionId,
} from '@src/types/database';
import ROUTES from '@src/ROUTES';
import Navigation, {navigationRef} from '@navigation/Navigation';
import {StackScreenProps} from '@react-navigation/stack';
import {useFocusEffect} from '@react-navigation/native';
import {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {DateData} from 'react-native-calendars';
import {getEmptySession} from '@libs/SessionUtils';
import DBPATHS from '@database/DBPATHS';
import useRefresh from '@hooks/useRefresh';

interface State {
  visibleDateObject: DateObject;
  drinkingSessionsCount: number;
  unitsConsumed: number;
  pointsEarned: number;
  initializingSession: boolean;
  ongoingSessionId: DrinkingSessionId | undefined;
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
  initializingSession: false,
  ongoingSessionId: undefined,
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
    case 'SET_INITIALIZING_SESSION':
      return {...state, initializingSession: action.payload};
    case 'SET_ONGOING_SESSION_ID':
      return {...state, ongoingSessionId: action.payload};
    default:
      return state;
  }
};

type HomeScreenProps = StackScreenProps<
  BottomTabNavigatorParamList,
  typeof SCREENS.HOME
>;

const HomeScreen = ({}: HomeScreenProps) => {
  const {auth, db, storage} = useFirebase();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {
    userStatusData,
    drinkingSessionData,
    preferences,
    userData,
    isLoading,
    refetch,
  } = useDatabaseData();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Handle drinking session button press
  const startDrinkingSession = async () => {
    if (!user) return null;
    if (state.ongoingSessionId) {
      Alert.alert(
        'A session already exists',
        "You can't start a new session while you are in one",
      );
      return;
    }
    dispatch({type: 'SET_INITIALIZING_SESSION', payload: true});
    // The user is not in an active session
    const newSessionData: DrinkingSession = getEmptySession(true, true);
    const newSessionId = generateDatabaseKey(
      db,
      DBPATHS.USER_DRINKING_SESSIONS_USER_ID.getRoute(user.uid),
    );
    if (!newSessionId) {
      Alert.alert(
        'New session key generation failed',
        "Couldn't generate a new session key",
      );
      return;
    }
    try {
      await startLiveDrinkingSession(
        db,
        user.uid,
        newSessionData,
        newSessionId,
      );
      Navigation.navigate(ROUTES.DRINKING_SESSION_LIVE.getRoute(newSessionId));
      dispatch({type: 'SET_ONGOING_SESSION_ID', payload: newSessionId});
      dispatch({type: 'SET_INITIALIZING_SESSION', payload: false});
    } catch (error: any) {
      Alert.alert(
        'New session initialization failed',
        'Could not start a new session: ' + error.message,
      );
      return;
    }
  };

  const openSessionInProgress = () => {
    if (!state.ongoingSessionId) {
      Alert.alert(
        'New session initialization failed',
        'Could not find the existing session',
      );
      return;
    }
    Navigation.navigate(
      ROUTES.DRINKING_SESSION_LIVE.getRoute(state.ongoingSessionId),
    );
  };

  const {onRefresh, refreshing, refreshCounter} = useRefresh({refetch});

  // Update the user last login time
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
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

  // Monitor visible month and various statistics
  useMemo(() => {
    if (!preferences) return;
    const drinkingSessionArray: DrinkingSessionArray = drinkingSessionData
      ? Object.values(drinkingSessionData)
      : [];
    let thisMonthUnits = calculateThisMonthUnits(
      state.visibleDateObject,
      drinkingSessionArray,
    );
    let thisMonthPoints = calculateThisMonthPoints(
      state.visibleDateObject,
      drinkingSessionArray,
      preferences.units_to_points,
    );
    let thisMonthSessionCount = getSingleMonthDrinkingSessions(
      timestampToDate(state.visibleDateObject.timestamp),
      drinkingSessionArray,
      false,
    ).length; // Replace this in the future

    dispatch({
      type: 'SET_DRINKING_SESSIONS_COUNT',
      payload: thisMonthSessionCount,
    });
    dispatch({type: 'SET_UNITS_CONSUMED', payload: thisMonthUnits});
    dispatch({type: 'SET_POINTS_EARNED', payload: thisMonthPoints});
  }, [drinkingSessionData, state.visibleDateObject, preferences]);

  useEffect(() => {
    if (!userStatusData) return;

    const currentSessionId: DrinkingSessionId | undefined = userStatusData
      .latest_session?.ongoing
      ? userStatusData.latest_session_id
      : undefined;

    dispatch({
      type: 'SET_ONGOING_SESSION_ID',
      payload: currentSessionId,
    });
  }, [userStatusData]);

  useFocusEffect(
    React.useCallback(() => {
      // Refetch relevant data every time the screen is focused
      refetch(['userStatusData', 'preferences', 'userData']);
    }, []),
  );
  if (!user) {
    Navigation.navigate(ROUTES.LOGIN);
    return;
  }
  if (!isOnline) return <UserOffline />;
  if (isLoading || state.initializingSession)
    return (
      <LoadingData
        loadingText={
          state.initializingSession ? 'Starting a new session...' : ''
        }
      />
    );
  if (!preferences || !userData) return;

  return (
    <>
      <View style={commonStyles.headerContainer}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            onPress={
              () => Navigation.navigate(ROUTES.PROFILE.getRoute(user.uid))
              // navigation.navigate('Profile Screen', {
              //   userId: user.uid,
              //   profileData: userData.profile,
              //   friends: userData.friends,
              //   drinkingSessionData: drinkingSessionData,
              //   preferences: preferences,
              // })
            }
            style={styles.profileButton}>
            <ProfileImage
              storage={storage}
              userId={user.uid}
              downloadPath={userData.profile.photo_url}
              style={styles.profileImage}
              refreshTrigger={refreshCounter}
            />
            <Text style={styles.headerUsername}>{user.displayName}</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.menuContainer}>
              <Text style={styles.yearMonthText}>{thisYearMonth}</Text>
          </View> */}
      </View>
      {/* <View style={styles.yearMonthContainer}>
        <Text style={styles.yearMonthText}>{thisYearMonth}</Text>
      </View> */}
      <ScrollView
        style={styles.mainScreenContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              onRefresh([
                'userStatusData',
                'preferences',
                'drinkingSessionData',
              ])
            }
          />
        }>
        {state.ongoingSessionId ? (
          <TouchableOpacity
            style={styles.userInSessionWarningContainer}
            onPress={openSessionInProgress}>
            <Text style={styles.userInSessionWarningText}>
              You are currently in session!
            </Text>
          </TouchableOpacity>
        ) : null}
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
          onDayPress={(day: DateData) => {
            Navigation.navigate(
              ROUTES.DAY_OVERVIEW.getRoute(
                timestampToDateString(day.timestamp),
              ),
            );
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
            iconSource={KirokuIcons.Social}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() => Navigation.navigate(ROUTES.SOCIAL)}
          />
          <MenuIcon
            iconId="achievement-icon"
            iconSource={KirokuIcons.Achievements}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() => Navigation.navigate(ROUTES.ACHIEVEMENTS)}
          />
        </View>
        <View
          style={[
            styles.mainScreenFooterHalfContainer,
            styles.mainScreenFooterRightContainer,
          ]}>
          <MenuIcon
            iconId="main-menu-popup-icon"
            iconSource={KirokuIcons.Statistics}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() => Navigation.navigate(ROUTES.STATISTICS)}
          />
          <MenuIcon
            iconId="main-menu-popup-icon"
            iconSource={KirokuIcons.BarMenu}
            containerStyle={styles.menuIconContainer}
            iconStyle={styles.menuIcon}
            onPress={() => Navigation.navigate(ROUTES.MAIN_MENU)}
          />
        </View>
      </View>
      {state.ongoingSessionId ? null : (
        <TouchableOpacity
          style={styles.startSessionButton}
          onPress={startDrinkingSession}>
          <Image source={KirokuIcons.Plus} style={styles.startSessionImage} />
        </TouchableOpacity>
      )}
    </>
  );
};

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
    marginTop: 2,
  },
  menuInfoItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFF99',
    width: '100%',
  },
  menuInfoText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    alignSelf: 'center',
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

export default HomeScreen;
