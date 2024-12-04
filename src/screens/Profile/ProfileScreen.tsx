import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {DateData} from 'react-native-calendars';
import commonStyles from '@styles/commonStyles';
import {useFirebase} from '@context/global/FirebaseContext';
import type {StatData} from '@components/Items/StatOverview';
import {StatsOverview} from '@components/Items/StatOverview';
import ProfileOverview from '@components/Social/ProfileOverview';
import React, {useEffect, useMemo, useState} from 'react';
import {readDataOnce} from '@database/baseFunctions';
import {
  calculateThisMonthUnits,
  dateToDateData,
  objKeys,
  timestampToDate,
  timestampToDateString,
} from '@libs/DataHandling';
import SessionsCalendar from '@components/SessionsCalendar';
import {getCommonFriendsCount} from '@libs/FriendUtils';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import type {DrinkingSessionArray} from '@src/types/onyx';
import type {UserList} from '@src/types/onyx/OnyxCommon';
import type {StackScreenProps} from '@react-navigation/stack';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import Navigation from '@libs/Navigation/Navigation';
import DBPATHS from '@src/DBPATHS';
import ROUTES from '@src/ROUTES';
import useFetchData from '@hooks/useFetchData';
import {getPlural} from '@libs/StringUtilsKiroku';
import ScreenWrapper from '@components/ScreenWrapper';
import type {FetchDataKeys} from '@hooks/useFetchData/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import ManageFriendPopover from '@components/ManageFriendPopover';

type ProfileScreenOnyxProps = {};

type ProfileScreenProps = ProfileScreenOnyxProps &
  StackScreenProps<ProfileNavigatorParamList, typeof SCREENS.PROFILE.ROOT>;

function ProfileScreen({route}: ProfileScreenProps) {
  const {auth, db} = useFirebase();
  const {userID} = route.params;
  const user = auth.currentUser;
  const relevantDataKeys: FetchDataKeys = [
    'userData',
    'drinkingSessionData',
    'preferences',
  ]; //
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const {data: fetchedData, isLoading} = useFetchData(userID, relevantDataKeys);

  const [selfFriends, setSelfFriends] = useState<UserList | undefined>();
  const [friendCount, setFriendCount] = useState(0);
  const [commonFriendCount, setCommonFriendCount] = useState(0);
  const [visibleDateData, setVisibleDateData] = useState(
    dateToDateData(new Date()),
  );
  const [drinkingSessionsCount, setDrinkingSessionsCount] = useState(0);
  const [unitsConsumed, setUnitsConsumed] = useState(0);
  const [manageFriendModalVisible, setManageFriendModalVisible] =
    useState(false);

  const userData = fetchedData?.userData;
  const drinkingSessionData = fetchedData?.drinkingSessionData;
  const preferences = fetchedData?.preferences;
  const profileData = userData?.profile;
  const friends = userData?.friends;

  const statsData: StatData = [
    {
      header: translate(
        'profileScreen.drinkingSessions',
        getPlural(drinkingSessionsCount),
      ),
      content: String(drinkingSessionsCount),
    },
    {
      header: translate('profileScreen.unitsConsumed'),
      content: String(roundToTwoDecimalPlaces(unitsConsumed)),
    },
  ];

  // Track own friends
  useEffect(() => {
    const getOwnFriends = async () => {
      if (!user) {
        return;
      }
      let ownFriends = friends;
      if (user?.uid !== userID) {
        ownFriends = await readDataOnce(
          db,
          DBPATHS.USERS_USER_ID_FRIENDS.getRoute(user.uid),
        );
      }
      setSelfFriends(ownFriends);
    };
    getOwnFriends();
  }, []);

  // Monitor friends count
  useMemo(() => {
    const friendCount = friends ? objKeys(friends).length : 0;
    const commonFriendCount = getCommonFriendsCount(
      objKeys(selfFriends),
      objKeys(friends),
    );
    setFriendCount(friendCount);
    setCommonFriendCount(commonFriendCount);
  }, [friends]);

  // Monitor stats
  useMemo(() => {
    if (!drinkingSessionData || !preferences) {
      return;
    }
    const drinkingSessionArray: DrinkingSessionArray =
      Object.values(drinkingSessionData);

    const thisMonthUnits = calculateThisMonthUnits(
      visibleDateData,
      drinkingSessionArray,
      preferences.drinks_to_units,
    );
    const thisMonthSessionCount = DSUtils.getSingleMonthDrinkingSessions(
      timestampToDate(visibleDateData.timestamp),
      drinkingSessionArray,
      false,
    ).length; // Replace this in the future

    setDrinkingSessionsCount(thisMonthSessionCount);
    setUnitsConsumed(thisMonthUnits);
  }, [drinkingSessionData, preferences, visibleDateData]);

  if (isLoading) {
    return <FullScreenLoadingIndicator />;
  }
  if (!profileData || !preferences || !userData) {
    return;
  }

  return (
    <ScreenWrapper testID={ProfileScreen.displayName}>
      <HeaderWithBackButton
        title={
          user?.uid === userID
            ? translate('profileScreen.title')
            : translate('profileScreen.titleNotSelf')
        }
        onBackButtonPress={Navigation.goBack}
      />
      <ScrollView
        style={localStyles.scrollView}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ProfileOverview
          userID={userID}
          profileData={profileData} // For live propagation of current user
        />
        <View style={localStyles.friendsInfoContainer}>
          <View style={localStyles.leftContainer}>
            <Text style={localStyles.friendsInfoHeading}>
              {`${
                user?.uid !== userID && commonFriendCount > 0 ? 'Common f' : 'F'
              }riends:`}
            </Text>
            <Text
              style={[
                localStyles.friendsInfoText,
                commonStyles.smallMarginLeft,
              ]}>
              {user?.uid !== userID && commonFriendCount > 0
                ? commonFriendCount
                : friendCount}
            </Text>
          </View>
          <View style={localStyles.rightContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                user?.uid === userID
                  ? Navigation.navigate(ROUTES.SOCIAL)
                  : Navigation.navigate(
                      ROUTES.PROFILE_FRIENDS_FRIENDS.getRoute(userID),
                    );
              }}
              style={localStyles.seeFriendsButton}>
              <Text
                style={[localStyles.friendsInfoText, commonStyles.linkText]}>
                {translate('profileScreen.seeAllFriends')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {drinkingSessionData ? (
          <View style={[styles.borderTop, styles.borderRadiusXLarge]}>
            <StatsOverview statsData={statsData} />
            <SessionsCalendar
              userID={userID}
              visibleDate={visibleDateData}
              onDateChange={(date: DateData) => setVisibleDateData(date)}
              drinkingSessionData={drinkingSessionData}
              preferences={preferences}
            />
          </View>
        ) : (
          <View style={[styles.borderTop, styles.borderRadiusXLarge]}>
            <Text
              style={[styles.textNormal, styles.textAlignCenter, styles.mt4]}>
              {translate(
                'profileScreen.noDrinkingSessions',
                user?.uid === userID,
              )}
            </Text>
          </View>
        )}
        <View style={localStyles.bottomContainer}>
          {user?.uid !== userID && (
            <Button
              text={translate('common.manage')}
              style={styles.m2}
              onPress={() => setManageFriendModalVisible(true)}
            />
          )}
        </View>
      </ScrollView>
      <ManageFriendPopover
        isVisible={manageFriendModalVisible}
        onClose={() => setManageFriendModalVisible(false)}
        friendId={userID}
      />
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  sectionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
  },
  editProfileButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    width: 'auto',
    height: 'auto',
    zIndex: -2,
  },
  editProfileIcon: {
    width: 24,
    height: 24,
    tintColor: '#1A3D32',
    backgroundColor: 'blue',
    zIndex: -3,
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
