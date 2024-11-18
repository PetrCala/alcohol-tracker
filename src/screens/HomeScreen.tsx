import React, {useEffect, useMemo, useReducer, useState} from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '@components/Buttons/MenuIcon';
import SessionsCalendar from '@components/Calendar';
import type {DateObject} from '@src/types/time';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {
  dateToDateObject,
  calculateThisMonthDrinks,
  calculateThisMonthUnits,
  getSingleMonthDrinkingSessions,
  timestampToDate,
  timestampToDateString,
} from '@libs/DataHandling';
import {useUserConnection} from '@context/global/UserConnectionContext';
import UserOffline from '@components/UserOfflineModal';
import {synchronizeUserStatus} from '@database/users';
import commonStyles from '@src/styles/commonStyles';
import {useFirebase} from '@context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import {generateDatabaseKey} from '@database/baseFunctions';
import CONST from '@src/CONST';
import type {
  DrinkingSession,
  DrinkingSessionArray,
  DrinkingSessionId,
} from '@src/types/onyx';
import ROUTES from '@src/ROUTES';
import Navigation, {navigationRef} from '@navigation/Navigation';
import type {StackScreenProps} from '@react-navigation/stack';
import {useFocusEffect} from '@react-navigation/native';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {DateData} from 'react-native-calendars';
import DBPATHS from '@database/DBPATHS';
import type {StatData} from '@components/Items/StatOverview';
import {StatsOverview} from '@components/Items/StatOverview';
import {getPlural} from '@libs/StringUtilsKiroku';
import {getReceivedRequestsCount} from '@libs/FriendUtils';
import FriendRequestCounter from '@components/Social/FriendRequestCounter';
import ScreenWrapper from '@components/ScreenWrapper';
import MessageBanner from '@components/Info/MessageBanner';
import VerifyEmailPopup from '@components/Popups/VerifyEmailPopup';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import * as DS from '@libs/actions/DrinkingSession';
import * as ErrorUtils from '@libs/ErrorUtils';
import useTheme from '@hooks/useTheme';
import Icon from '@components/Icon';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';

type State = {
  visibleDateObject: DateObject;
  drinkingSessionsCount: number;
  drinksConsumed: number;
  unitsConsumed: number;
  ongoingSessionId: DrinkingSessionId | undefined;
  verifyEmailModalVisible: boolean;
  shouldNavigateToTzFix: boolean;
};

type Action = {
  type: string;
  payload: any;
};

const initialState: State = {
  visibleDateObject: dateToDateObject(new Date()),
  drinkingSessionsCount: 0,
  drinksConsumed: 0,
  unitsConsumed: 0,
  ongoingSessionId: undefined,
  verifyEmailModalVisible: false,
  shouldNavigateToTzFix: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_VISIBLE_DATE_OBJECT':
      return {...state, visibleDateObject: action.payload};
    case 'SET_DRINKING_SESSIONS_COUNT':
      return {...state, drinkingSessionsCount: action.payload};
    case 'SET_DRINKS_CONSUMED':
      return {...state, drinksConsumed: action.payload};
    case 'SET_UNITS_CONSUMED':
      return {...state, unitsConsumed: action.payload};
    case 'SET_ONGOING_SESSION_ID':
      return {...state, ongoingSessionId: action.payload};
    case 'SET_VERIFY_EMAIL_MODAL_VISIBLE':
      return {...state, verifyEmailModalVisible: action.payload};
    case 'SET_SHOULD_NAVIGATE_TO_TZ_FIX':
      return {...state, shouldNavigateToTzFix: action.payload};
    default:
      return state;
  }
};

type HomeScreenOnyxProps = {};

type HomeScreenProps = HomeScreenOnyxProps &
  StackScreenProps<BottomTabNavigatorParamList, typeof SCREENS.HOME>;

function HomeScreen({route}: HomeScreenProps) {
  const styles = useThemeStyles();
  const theme = useTheme();
  const {auth, db, storage} = useFirebase();
  const {translate} = useLocalize();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {
    userStatusData,
    drinkingSessionData,
    preferences,
    userData,
    isLoading,
  } = useDatabaseData();
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  const statsData: StatData = [
    {
      header: `Drinking Session${getPlural(state.drinkingSessionsCount)}`,
      content: String(state.drinkingSessionsCount),
    },
    {
      header: 'Units Consumed',
      content: String(roundToTwoDecimalPlaces(state.unitsConsumed)),
    },
  ];

  // If there is an ongoing session, open it, otherwise start a new one
  const onOpenLiveSessionPress = async () => {
    if (state?.ongoingSessionId) {
      // Assume the live session data is in sync with the database
      Navigation.navigate(
        ROUTES.DRINKING_SESSION_LIVE.getRoute(state.ongoingSessionId),
      );
      return;
    }

    try {
      setIsStartingSession(true);
      const newSessionId = await DS.startLiveDrinkingSession(db, user);
      dispatch({type: 'SET_ONGOING_SESSION_ID', payload: newSessionId});
      Navigation.navigate(ROUTES.DRINKING_SESSION_LIVE.getRoute(newSessionId));
    } catch (error: any) {
      ErrorUtils.raiseAlert(error, translate('homeScreen.error.title'));
    } finally {
      setIsStartingSession(false);
    }
  };

  // Monitor visible month and various statistics
  useMemo(() => {
    if (!preferences) {
      return;
    }
    const drinkingSessionArray: DrinkingSessionArray = drinkingSessionData
      ? Object.values(drinkingSessionData)
      : [];
    const thisMonthDrinks = calculateThisMonthDrinks(
      state.visibleDateObject,
      drinkingSessionArray,
    );
    const thisMonthUnits = calculateThisMonthUnits(
      state.visibleDateObject,
      drinkingSessionArray,
      preferences.drinks_to_units,
    );
    const thisMonthSessionCount = getSingleMonthDrinkingSessions(
      timestampToDate(state.visibleDateObject.timestamp),
      drinkingSessionArray,
      false,
    ).length; // Replace this in the future

    dispatch({
      type: 'SET_DRINKING_SESSIONS_COUNT',
      payload: thisMonthSessionCount,
    });
    dispatch({type: 'SET_DRINKS_CONSUMED', payload: thisMonthDrinks});
    dispatch({type: 'SET_UNITS_CONSUMED', payload: thisMonthUnits});
  }, [drinkingSessionData, state.visibleDateObject, preferences]);

  useMemo(() => {
    const sessionsAreMissingTz =
      !DSUtils.allSessionsContainTimezone(drinkingSessionData);

    // Only navigate in case the user is setting up TZ for the first time
    const shouldNavigateToTzFix = sessionsAreMissingTz && !!!userData?.timezone;

    dispatch({
      type: 'SET_SHOULD_NAVIGATE_TO_TZ_FIX',
      payload: shouldNavigateToTzFix,
    });
  }, [drinkingSessionData, userData]);

  useEffect(() => {
    if (!userStatusData) {
      return;
    }

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
      // Update user status on home screen focus
      if (!user || !userData || !preferences || !drinkingSessionData) {
        return;
      }
      try {
        synchronizeUserStatus(
          db,
          user.uid,
          userStatusData,
          drinkingSessionData,
        );
      } catch (error: any) {
        Alert.alert(
          'Failed to contact the database',
          'Could not update user online status:' + error.message,
        );
      }
      // TZFIX (09-2024) - Redirect to TZ_FIX_INTRODUCTION if user has not set timezone
      if (state.shouldNavigateToTzFix) {
        Navigation.navigate(ROUTES.TZ_FIX_INTRODUCTION);
      }
    }, [
      userData,
      preferences,
      drinkingSessionData,
      state.shouldNavigateToTzFix,
    ]),
  );

  // Ensure the live session data is in sync with the database on component mount
  useEffect(() => {
    DS.syncLocalLiveSessionData(state.ongoingSessionId, drinkingSessionData);
  }, [state.ongoingSessionId, drinkingSessionData]);

  if (!user) {
    Navigation.resetToHome();
    return;
  }
  if (!isOnline) {
    return <UserOffline />;
  }
  if (
    isLoading ||
    isStartingSession ||
    !preferences ||
    !userData ||
    !userStatusData
  ) {
    return (
      <FullScreenLoadingIndicator
        loadingText={
          (isStartingSession && translate('homeScreen.startingSession')) || ''
        }
      />
    );
  }

  return (
    <ScreenWrapper
      testID={HomeScreen.displayName}
      includePaddingTop={false}
      includeSafeAreaPaddingBottom={getPlatform() !== CONST.PLATFORM.IOS}>
      <View style={[commonStyles.headerContainer, styles.borderBottom]}>
        {userData && (
          <View style={localStyles.profileContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() =>
                Navigation.navigate(ROUTES.PROFILE.getRoute(user.uid))
              }
              style={localStyles.profileButton}>
              <ProfileImage
                storage={storage}
                userID={user.uid}
                downloadPath={userData.profile.photo_url}
                style={localStyles.profileImage}
                // refreshTrigger={refreshCounter}
                refreshTrigger={0}
              />
              <Text style={[styles.headerText, styles.textLarge, styles.ml3]}>
                {user.displayName}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Enable later on */}
        {/* <View style={localStyles.menuContainer}>
          <TouchableOpacity style={localStyles.notificationsButton}>
            <Image source={KirokuIcons.Bell} style={localStyles.notificationsIcon} />
          </TouchableOpacity>
        </View> */}
      </View>
      <ScrollView>
        {state.ongoingSessionId && (
          <MessageBanner
            text="You are currently in session!"
            onPress={onOpenLiveSessionPress}
            danger
          />
        )}
        {/* User verification modal -- Enable later on
        {user.emailVerified ? null : (
          <MessageBanner
            text="Your email is not verified!"
            onPress={() =>
              dispatch({type: 'SET_VERIFY_EMAIL_MODAL_VISIBLE', payload: true})
            }
          />
        )} */}
        <View style={localStyles.statsOverviewHolder}>
          <StatsOverview statsData={statsData} />
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
      </ScrollView>
      <View style={commonStyles.mainFooter}>
        <View
          style={[
            localStyles.mainScreenFooterHalfContainer,
            localStyles.mainScreenFooterLeftContainer,
          ]}>
          <View style={localStyles.socialContainer}>
            <MenuIcon
              iconId="social-icon"
              iconSource={KirokuIcons.Social}
              containerStyle={localStyles.menuIconContainer}
              iconStyle={localStyles.menuIcon}
              onPress={() => Navigation.navigate(ROUTES.SOCIAL)}
            />
            <FriendRequestCounter
              count={getReceivedRequestsCount(userData?.friend_requests)}
              style={localStyles.friendRequestCounter}
            />
          </View>
          <MenuIcon
            iconId="achievement-icon"
            iconSource={KirokuIcons.Achievements}
            containerStyle={localStyles.menuIconContainer}
            iconStyle={localStyles.menuIcon}
            onPress={() => Navigation.navigate(ROUTES.ACHIEVEMENTS)}
          />
        </View>
        <View
          style={[
            localStyles.mainScreenFooterHalfContainer,
            localStyles.mainScreenFooterRightContainer,
          ]}>
          <MenuIcon
            iconId="settings-popup-icon"
            iconSource={KirokuIcons.Statistics}
            containerStyle={localStyles.menuIconContainer}
            iconStyle={localStyles.menuIcon}
            onPress={() => Navigation.navigate(ROUTES.STATISTICS)}
          />
          <MenuIcon
            iconId="settings-popup-icon"
            iconSource={KirokuIcons.BarMenu}
            containerStyle={localStyles.menuIconContainer}
            iconStyle={localStyles.menuIcon}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS)}
          />
        </View>
      </View>
      {!state.ongoingSessionId && (
        <TouchableOpacity
          accessibilityRole="button"
          style={[localStyles.startSessionButton, styles.buttonSuccess]}
          onPress={onOpenLiveSessionPress}>
          <Icon
            src={KirokuIcons.Plus}
            height={36}
            width={36}
            fill={theme.textLight}
          />
        </TouchableOpacity>
      )}
      <VerifyEmailPopup
        visible={state.verifyEmailModalVisible}
        onRequestClose={() =>
          dispatch({
            type: 'SET_VERIFY_EMAIL_MODAL_VISIBLE',
            payload: false,
          })
        }
      />
    </ScreenWrapper>
  );
}

const screenWidth = Dimensions.get('window').width;
const currentPlatform = getPlatform();
const iconSize = currentPlatform === CONST.PLATFORM.IOS ? 48 : 28;

const localStyles = StyleSheet.create({
  profileContainer: {
    //Ensure the container fills all space between, no more, no less
    padding: 10,
    height: '100%',
    width: '85%',
  },
  profileButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '15%',
  },
  menuIconContainer: {
    width: 'auto',
    height: 'auto',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: iconSize,
    height: iconSize,
    padding: 10,
  },
  notificationsButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsIcon: {
    width: 24,
    height: 24,
  },
  socialContainer: {
    flexDirection: 'row',
  },
  friendRequestCounter: {
    marginLeft: -6,
    marginRight: 6,
  },
  statsOverviewHolder: {
    minHeight: 120,
    flexDirection: 'row',
    width: screenWidth,
  },
  startSessionButton: {
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: [{translateX: -35}],
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
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

HomeScreen.displayName = 'Home Screen';

export default HomeScreen;
