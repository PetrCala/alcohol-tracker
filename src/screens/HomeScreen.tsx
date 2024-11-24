import React, {useEffect, useMemo, useReducer, useState} from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '@components/Buttons/MenuIcon';
import SessionsCalendar from '@components/SessionsCalendar';
import type {DateData} from 'react-native-calendars';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {
  calculateThisMonthDrinks,
  calculateThisMonthUnits,
  timestampToDate,
  dateToDateData,
} from '@libs/DataHandling';
import {useUserConnection} from '@context/global/UserConnectionContext';
import UserOffline from '@components/UserOfflineModal';
import {synchronizeUserStatus} from '@database/users';
import {useFirebase} from '@context/global/FirebaseContext';
import ProfileImage from '@components/ProfileImage';
import CONST from '@src/CONST';
import type {DrinkingSessionArray, DrinkingSessionId} from '@src/types/onyx';
import ROUTES from '@src/ROUTES';
import Navigation from '@navigation/Navigation';
import type {StackScreenProps} from '@react-navigation/stack';
import {useFocusEffect} from '@react-navigation/native';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {StatData} from '@components/Items/StatOverview';
import {StatsOverview} from '@components/Items/StatOverview';
import {getPlural} from '@libs/StringUtilsKiroku';
import {getReceivedRequestsCount} from '@libs/FriendUtils';
import ScreenWrapper from '@components/ScreenWrapper';
import MessageBanner from '@components/Info/MessageBanner';
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
import NoSessionsInfo from '@components/NoSessionsInfo';
import Text from '@components/Text';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Button from '@components/Button';
import BottomTabBarIcon from '@components/BottomTabBarIcon';

type State = {
  drinkingSessionsCount: number;
  drinksConsumed: number;
  unitsConsumed: number;
  shouldNavigateToTzFix: boolean;
};

type Action = {
  type: string;
  payload: any;
};

const initialState: State = {
  drinkingSessionsCount: 0,
  drinksConsumed: 0,
  unitsConsumed: 0,
  shouldNavigateToTzFix: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_DRINKING_SESSIONS_COUNT':
      return {...state, drinkingSessionsCount: action.payload};
    case 'SET_DRINKS_CONSUMED':
      return {...state, drinksConsumed: action.payload};
    case 'SET_UNITS_CONSUMED':
      return {...state, unitsConsumed: action.payload};
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
  const {windowWidth} = useWindowDimensions();
  const {
    userStatusData,
    drinkingSessionData,
    preferences,
    userData,
    isLoading,
  } = useDatabaseData();
  const [visibleDate, setVisibleDate] = useState<DateData>(
    dateToDateData(new Date()),
  );
  const [ongoingSessionId, setOngoingSessionId] = useState<
    DrinkingSessionId | null | undefined
  >();
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

  const onOpenLiveSessionPress = async () => {
    // If there is an ongoing session, open it
    if (ongoingSessionId) {
      try {
        if (!drinkingSessionData) {
          throw new Error(translate('homeScreen.error.title'));
        }
        const session = drinkingSessionData[ongoingSessionId];
        DS.navigateToLiveSessionScreen(session?.id, session);
      } catch (error: any) {
        ErrorUtils.raiseAlert(error);
      }
      return;
    }

    // Start a new session
    try {
      setIsStartingSession(true);
      const newSession = await DS.startLiveDrinkingSession(
        db,
        user,
        userData?.timezone?.selected,
      );
      setOngoingSessionId(newSession?.id);
      DS.navigateToLiveSessionScreen(newSession?.id, newSession);
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
      visibleDate,
      drinkingSessionArray,
    );
    const thisMonthUnits = calculateThisMonthUnits(
      visibleDate,
      drinkingSessionArray,
      preferences.drinks_to_units,
    );
    const thisMonthSessionCount = DSUtils.getSingleMonthDrinkingSessions(
      timestampToDate(visibleDate.timestamp),
      drinkingSessionArray,
      false,
    ).length; // Replace this in the future

    dispatch({
      type: 'SET_DRINKING_SESSIONS_COUNT',
      payload: thisMonthSessionCount,
    });
    dispatch({type: 'SET_DRINKS_CONSUMED', payload: thisMonthDrinks});
    dispatch({type: 'SET_UNITS_CONSUMED', payload: thisMonthUnits});
  }, [drinkingSessionData, visibleDate, preferences]);

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
    setOngoingSessionId(
      userStatusData?.latest_session?.ongoing
        ? userStatusData?.latest_session_id
        : undefined,
    );
  }, [userStatusData]);

  useFocusEffect(
    React.useCallback(() => {
      // Update user status on home screen focus
      if (!user || !userData || !preferences) {
        return;
      }
      try {
        synchronizeUserStatus(db, user.uid, drinkingSessionData);
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
  if (!user) {
    return;
  }
  if (!isOnline) {
    return <UserOffline />;
  }
  if (isLoading || isStartingSession || !preferences || !userData) {
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
      {/* // TODO rewrite this into the HeaderWithBackButton component */}
      <View style={[styles.headerBar, styles.borderBottom]}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(user.uid))}
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
      <ScrollView>
        {ongoingSessionId && (
          <MessageBanner
            text={translate('homeScreen.currentlyInSession')}
            onPress={onOpenLiveSessionPress}
            danger
          />
        )}
        {!!drinkingSessionData ? (
          <>
            <View style={localStyles.statsOverviewHolder}>
              <StatsOverview statsData={statsData} />
            </View>
            <SessionsCalendar
              userID={user.uid}
              visibleDate={visibleDate}
              onDateChange={(date: DateData) => setVisibleDate(date)}
              drinkingSessionData={drinkingSessionData}
              preferences={preferences}
            />
          </>
        ) : (
          <NoSessionsInfo />
        )}
      </ScrollView>
      <View style={styles.bottomTabBarContainer}>
        <View style={[localStyles.mainScreenFooterHalfContainer, styles.pr9]}>
          <BottomTabBarIcon
            src={KirokuIcons.Social}
            onPress={() => Navigation.navigate(ROUTES.SOCIAL)}
            accessibilityLabel="Social"
            counter={getReceivedRequestsCount(userData?.friend_requests)}
          />
          <BottomTabBarIcon
            src={KirokuIcons.Achievements}
            onPress={() => Navigation.navigate(ROUTES.ACHIEVEMENTS)}
            accessibilityLabel="Achievements"
          />
        </View>
        <View style={[localStyles.mainScreenFooterHalfContainer, styles.pl9]}>
          <BottomTabBarIcon
            src={KirokuIcons.Statistics}
            onPress={() => Navigation.navigate(ROUTES.STATISTICS)}
            accessibilityLabel="Statistics"
          />
          <BottomTabBarIcon
            src={KirokuIcons.BarMenu}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            accessibilityLabel="Settings"
          />
        </View>
      </View>
      {!ongoingSessionId && (
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.startSessionPlusButton(windowWidth)}
          onPress={onOpenLiveSessionPress}>
          <Icon
            src={KirokuIcons.Plus}
            height={36}
            width={36}
            fill={theme.textLight}
          />
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const screenWidth = Dimensions.get('window').width;
// const iconSize = currentPlatform === CONST.PLATFORM.IOS ? 48 : 28;

const localStyles = StyleSheet.create({
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  socialContainer: {
    flexDirection: 'row',
  },
  statsOverviewHolder: {
    minHeight: 120,
    flexDirection: 'row',
    width: screenWidth,
  },
  mainScreenFooterHalfContainer: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  mainScreenFooterLeftContainer: {
    paddingRight: 36,
  },
  mainScreenFooterRightContainer: {
    paddingLeft: 36,
  },
});

HomeScreen.displayName = 'Home Screen';

export default HomeScreen;
