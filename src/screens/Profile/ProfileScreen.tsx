import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import commonStyles from '../../styles/commonStyles';
import {useFirebase} from '../../context/global/FirebaseContext';
import type {StatData} from '@components/Items/StatOverview';
import { StatsOverview} from '@components/Items/StatOverview';
import ProfileOverview from '@components/Social/ProfileOverview';
import React, {useEffect, useMemo, useReducer} from 'react';
import {readDataOnce} from '@database/baseFunctions';
import {
  calculateThisMonthUnits,
  dateToDateObject,
  getSingleMonthDrinkingSessions,
  objKeys,
  roundToTwoDecimalPlaces,
  timestampToDate,
  timestampToDateString,
} from '@libs/DataHandling';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import type {DateObject} from '@src/types/time';
import SessionsCalendar from '@components/Calendar';
import LoadingData from '@components/LoadingData';
import {fetchUserFriends, getCommonFriendsCount} from '@libs/FriendUtils';
import MainHeader from '@components/Header/MainHeader';
import ManageFriendPopup from '@components/Popups/Profile/ManageFriendPopup';
import type {DrinkingSessionArray, UserList} from '@src/types/database';
import { UserProps} from '@src/types/database';
import type {StackScreenProps} from '@react-navigation/stack';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import Navigation from '@libs/Navigation/Navigation';
import DBPATHS from '@database/DBPATHS';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import ROUTES from '@src/ROUTES';
import type {DateData} from 'react-native-calendars';
import useFetchData from '@hooks/useFetchData';
import {sendFriendRequest} from '@database/friends';
import {getPlural} from '@libs/StringUtils';
import ScreenWrapper from '@components/ScreenWrapper';
import type { FetchDataKeys} from '@hooks/useFetchData/types';
import {FetchData} from '@hooks/useFetchData/types';
import useListenToData from '@hooks/useListenToData';

type State = {
  selfFriends: UserList | undefined;
  friendCount: number;
  commonFriendCount: number;
  visibleDateObject: DateObject;
  drinkingSessionsCount: number;
  unitsConsumed: number;
  manageFriendModalVisible: boolean;
  unfriendModalVisible: boolean;
}

type Action = {
  type: string;
  payload: any;
}

const initialState: State = {
  selfFriends: undefined,
  friendCount: 0,
  commonFriendCount: 0,
  visibleDateObject: dateToDateObject(new Date()),
  drinkingSessionsCount: 0,
  unitsConsumed: 0,
  manageFriendModalVisible: false,
  unfriendModalVisible: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SELF_FRIENDS':
      return {...state, selfFriends: action.payload};
    case 'SET_FRIEND_COUNT':
      return {...state, friendCount: action.payload};
    case 'SET_COMMON_FRIEND_COUNT':
      return {...state, commonFriendCount: action.payload};
    case 'SET_VISIBLE_DATE_OBJECT':
      return {...state, visibleDateObject: action.payload};
    case 'SET_DRINKING_SESSIONS_COUNT':
      return {...state, drinkingSessionsCount: action.payload};
    case 'SET_UNITS_CONSUMED':
      return {...state, unitsConsumed: action.payload};
    case 'SET_MANAGE_FRIEND_MODAL_VISIBLE':
      return {...state, manageFriendModalVisible: action.payload};
    case 'SET_UNFRIEND_MODAL_VISIBLE':
      return {...state, unfriendModalVisible: action.payload};
    default:
      return state;
  }
};

type ProfileScreenProps = StackScreenProps<
  ProfileNavigatorParamList,
  typeof SCREENS.PROFILE.ROOT
>;

function ProfileScreen({route}: ProfileScreenProps) {
  const {auth, db} = useFirebase();
  const {userId} = route.params;
  const user = auth.currentUser;
  const relevantDataKeys: FetchDataKeys = [
    'userData',
    'drinkingSessionData',
    'preferences',
  ];
  // Use the user's data at first (cost-free). If this is not self profile, fetch the data.
  let {userData, drinkingSessionData, preferences, isLoading} =
    useDatabaseData();
  let loading = isLoading;
  if (userId !== user?.uid) {
    const {data, isLoading} = useFetchData(userId, relevantDataKeys);
    userData = data.userData;
    drinkingSessionData = data.drinkingSessionData;
    preferences = data.preferences;
    loading = isLoading;
  }
  const profileData = userData?.profile;
  const friends = userData?.friends;
  const [state, dispatch] = useReducer(reducer, initialState);

  // Define your stats data
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

  // Track own friends
  useEffect(() => {
    const getOwnFriends = async () => {
      if (!user) {return;}
      let ownFriends = friends;
      if (user?.uid !== userId) {
        ownFriends = await readDataOnce(
          db,
          DBPATHS.USERS_USER_ID_FRIENDS.getRoute(user.uid),
        );
      }
      dispatch({type: 'SET_SELF_FRIENDS', payload: ownFriends});
    };
    getOwnFriends();
  }, []);

  // Monitor friends count
  useMemo(() => {
    const friendCount = friends ? objKeys(friends).length : 0;
    const commonFriendCount = getCommonFriendsCount(
      objKeys(state.selfFriends),
      objKeys(friends),
    );
    dispatch({type: 'SET_FRIEND_COUNT', payload: friendCount});
    dispatch({type: 'SET_COMMON_FRIEND_COUNT', payload: commonFriendCount});
  }, [friends]);

  // Monitor stats
  useMemo(() => {
    if (!drinkingSessionData || !preferences) {return;}
    const drinkingSessionArray: DrinkingSessionArray =
      Object.values(drinkingSessionData);

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
    dispatch({type: 'SET_UNITS_CONSUMED', payload: thisMonthUnits});
  }, [drinkingSessionData, preferences, state.visibleDateObject]);

  if (isLoading) {return <LoadingData />;}
  if (!profileData || !preferences || !userData) {return;}

  return (
    <ScreenWrapper testID={ProfileScreen.displayName}>
      <MainHeader
        headerText={user?.uid === userId ? 'Profile' : 'Friend Overview'}
        onGoBack={() => Navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollView}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* {user?.uid === userId && (
          <TouchableOpacity
            onPress={() =>
              Navigation.navigate(ROUTES.PROFILE_EDIT.getRoute(userId))
            }
            style={styles.editProfileButton}>
            <Image source={KirokuIcons.Pencil} style={styles.editProfileIcon} />
          </TouchableOpacity>
        )} */}
        <ProfileOverview
          userId={userId}
          profileData={profileData} // For live propagation of current user
        />
        <View style={styles.friendsInfoContainer}>
          <View style={styles.leftContainer}>
            <Text style={styles.friendsInfoHeading}>Friends:</Text>
            <Text
              style={[styles.friendsInfoText, commonStyles.smallMarginLeft]}>
              {state.friendCount}
            </Text>
            {user?.uid === userId ? null : (
              <Text
                style={[styles.friendsInfoText, commonStyles.smallMarginLeft]}>
                ({state.commonFriendCount} common)
              </Text>
            )}
          </View>
          <View style={styles.rightContainer}>
            <TouchableOpacity accessibilityRole="button"
              onPress={() => {
                user?.uid === userId
                  ? Navigation.navigate(ROUTES.SOCIAL)
                  : Navigation.navigate(
                      ROUTES.PROFILE_FRIENDS_FRIENDS.getRoute(userId),
                    );
              }}
              style={styles.seeFriendsButton}>
              <Text style={[styles.friendsInfoText, commonStyles.linkText]}>
                See all friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={commonStyles.horizontalLine} />
        <View style={styles.statsOverviewHolder}>
          <StatsOverview statsData={statsData} />
        </View>
        <SessionsCalendar
          drinkingSessionData={drinkingSessionData}
          preferences={preferences}
          visibleDateObject={state.visibleDateObject}
          dispatch={dispatch}
          onDayPress={(day: DateData) => {
            user?.uid === userId
              ? Navigation.navigate(
                  ROUTES.DAY_OVERVIEW.getRoute(
                    timestampToDateString(day.timestamp),
                  ),
                )
              : null;
          }}
        />
        <View style={styles.bottomContainer}>
          {user?.uid !== userId ? (
            <TouchableOpacity accessibilityRole="button"
              style={styles.manageFriendButton}
              onPress={() =>
                dispatch({
                  type: 'SET_MANAGE_FRIEND_MODAL_VISIBLE',
                  payload: true,
                })
              }>
              <Text style={styles.manageFriendButtonText}>Manage</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={{height: 200, backgroundColor: '#ffff99'}}></View>
      </ScrollView>
      <ManageFriendPopup
        visible={state.manageFriendModalVisible}
        setVisibility={(visible: boolean) =>
          dispatch({type: 'SET_MANAGE_FRIEND_MODAL_VISIBLE', payload: visible})
        }
        onGoBack={() => Navigation.goBack()}
        friendId={userId}
      />
    </ScreenWrapper>
  );
}

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  sectionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  scrollView: {
    backgroundColor: '#ffff99',
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
  },
  editProfileButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 'auto',
    height: 'auto',
  },
  editProfileIcon: {
    width: 25,
    height: 25,
    padding: 5,
    tintColor: '#000',
  },
  friendsInfoContainer: {
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    margin: 10,
  },
  friendsInfoHeading: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    textAlign: 'center',
  },
  friendsInfoText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  leftContainer: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightContainer: {
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  seeFriendsButton: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsOverviewHolder: {
    height: 120,
    flexDirection: 'row',
    width: screenWidth,
  },
  bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  manageFriendButton: {
    width: '30%',
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'black',
    margin: 10,
  },
  manageFriendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

ProfileScreen.displayName = 'Profile Screen';
export default ProfileScreen;
