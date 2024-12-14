import {Keyboard, StyleSheet, View} from 'react-native';
import type {
  FriendRequestStatus,
  ProfileList,
  FriendRequestList,
} from '@src/types/onyx';
import type {UserList} from '@src/types/onyx/OnyxCommon';
import {useEffect, useMemo, useState} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import {isNonEmptyArray} from '@libs/Validation';
import {searchArrayByText} from '@libs/Search';
import * as Profile from '@userActions/Profile';
import SearchResult from '@components/Social/SearchResult';
import SearchWindow from '@components/Social/SearchWindow';
import GrayHeader from '@components/Header/GrayHeader';
import {getCommonFriends, getCommonFriendsCount} from '@libs/FriendUtils';
import type {
  UserIDToNicknameMapping,
  UserSearchResults,
} from '@src/types/various/Search';
import * as ErrorUtils from '@libs/ErrorUtils';
import {objKeys} from '@libs/DataHandling';
import {getNicknameMapping} from '@libs/SearchUtils';
import FillerView from '@components/FillerView';
import type {StackScreenProps} from '@react-navigation/stack';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import DBPATHS from '@src/DBPATHS';
import {readDataOnce} from '@database/baseFunctions';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import Button from '@components/Button';
import Text from '@components/Text';
import ScrollView from '@components/ScrollView';

type FriendsFriendsScreenProps = StackScreenProps<
  ProfileNavigatorParamList,
  typeof SCREENS.PROFILE.FRIENDS_FRIENDS
>;

function FriendsFriendsScreen({route}: FriendsFriendsScreenProps) {
  const styles = useThemeStyles();
  const {userID} = route.params;
  const {auth, db, storage} = useFirebase();
  const {userData} = useDatabaseData();
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const [searching, setSearching] = useState<boolean>(false);
  const [friends, setFriends] = useState<UserList | undefined>(undefined);
  const [displayedFriends, setDisplayedFriends] = useState<UserSearchResults>(
    [],
  );
  const [commonFriends, setCommonFriends] = useState<UserSearchResults>([]);
  const [otherFriends, setOtherFriends] = useState<UserSearchResults>([]);
  const [requestStatuses, setRequestStatuses] = useState<
    Record<string, FriendRequestStatus | undefined>
  >({});
  const [noUsersFound, setNoUsersFound] = useState<boolean>(false);
  const [displayData, setDisplayData] = useState<ProfileList>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const localSearch = async (searchText: string): Promise<void> => {
    try {
      const searchMapping: UserIDToNicknameMapping = getNicknameMapping(
        displayData,
        'display_name',
      );
      const relevantResults = searchArrayByText(
        objKeys(friends),
        searchText,
        searchMapping,
      );
      setDisplayedFriends(relevantResults); // Hide irrelevant
    } catch (error) {
      ErrorUtils.raiseAlert(error, translate('onyx.error.generic'));
    }
  };

  const updateDisplayData = async (
    searchResultData: UserSearchResults,
  ): Promise<void> => {
    const newDisplayData: ProfileList = await Profile.fetchUserProfiles(
      db,
      searchResultData,
    );
    setDisplayData(newDisplayData);
  };

  useMemo(() => {
    const updateRequestStatuses = (
      friendRequests: FriendRequestList | undefined,
    ): void => {
      const newRequestStatuses: Record<string, FriendRequestStatus> = {};
      if (friendRequests) {
        Object.keys(friendRequests).forEach(userID => {
          newRequestStatuses[userID] = friendRequests[userID];
        });
      }
      setRequestStatuses(newRequestStatuses);
    };
    updateRequestStatuses(userData?.friend_requests);
  }, [userData?.friend_requests, friends]);

  const updateHooksBasedOnSearchResults = async (
    searchResults: UserSearchResults,
  ): Promise<void> => {
    // updateRequestStatuses(searchResults); // Perhaps redundant
    await updateDisplayData(searchResults); // Assuming this returns a Promise
    const noUsersFound = !isNonEmptyArray(searchResults);
    setNoUsersFound(noUsersFound);
  };

  const renderSearchResults = (renderCommonFriends: boolean): JSX.Element[] => {
    return displayedFriends
      .filter(userID => commonFriends.includes(userID) === renderCommonFriends)
      .map(userID => (
        <SearchResult
          key={`${userID}-container`}
          userID={userID}
          userDisplayData={displayData[userID]}
          db={db}
          storage={storage}
          // @ts-ignore
          userFrom={user.uid}
          requestStatus={requestStatuses[userID]}
          alreadyAFriend={userData?.friends ? userData?.friends[userID] : false}
          customButton={
            renderCommonFriends && (
              <Button
                key={`${userID}-button`}
                text={translate('friendsFriendsScreen.seeProfile')}
                onPress={() =>
                  Navigation.navigate(ROUTES.PROFILE.getRoute(userID))
                }
                style={[styles.alignItemsCenter, styles.justifyContentCenter]}
              />
            )
          }
        />
      ));
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const userFriends: UserList | undefined = await readDataOnce(
        db,
        DBPATHS.USERS_USER_ID_FRIENDS.getRoute(userID),
      );
      setFriends(userFriends);
    } finally {
      setIsLoading(false);
    }
  };

  // Database data hooks
  useEffect(() => {
    fetchData();
  }, [userID]);

  // Monitor friend groups
  useMemo(() => {
    let commonFriends: string[] = [];
    let otherFriends: string[] = [];
    if (friends) {
      commonFriends = getCommonFriends(
        objKeys(friends),
        objKeys(userData?.friends),
      );
      otherFriends = objKeys(friends).filter(
        friend => !commonFriends.includes(friend),
      );
    }
    setCommonFriends(commonFriends);
    setOtherFriends(otherFriends);
  }, [userData, friends, requestStatuses]);

  useMemo(() => {
    let noUsersFound = true;
    if (isNonEmptyArray(displayedFriends)) {
      noUsersFound = false;
    }
    setNoUsersFound(noUsersFound);
  }, [displayedFriends]);

  useEffect(() => {
    const initialSearch = async (): Promise<void> => {
      setSearching(true);
      const friendIds = objKeys(friends);
      await updateHooksBasedOnSearchResults(friendIds);
      setDisplayedFriends(friendIds);
      setSearching(false);
    };
    initialSearch();
  }, [friends]);

  const resetSearch = (): void => {
    // Reset all values displayed on screen
    const friendIds = objKeys(friends);
    setDisplayedFriends(friendIds);
    setSearching(false);
    setNoUsersFound(false);
  };

  return (
    <ScreenWrapper testID={FriendsFriendsScreen.displayName}>
      <HeaderWithBackButton
        title={translate('friendsFriendsScreen.title')}
        onBackButtonPress={Navigation.goBack}
      />
      <SearchWindow
        windowText={translate('friendsFriendsScreen.searchUsersFriends')}
        onSearch={localSearch}
        onResetSearch={resetSearch}
        searchOnTextChange
      />
      <ScrollView
        style={localStyles.scrollViewContainer}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled">
        <View style={localStyles.searchResultsContainer}>
          {searching ? (
            <FlexibleLoadingIndicator />
          ) : isNonEmptyArray(displayedFriends) ? (
            <View style={styles.appBG}>
              <GrayHeader
                headerText={`${translate('friendsFriendsScreen.commonFriends')} (${getCommonFriendsCount(
                  commonFriends,
                  displayedFriends,
                )})`}
              />
              {renderSearchResults(true)}
              <GrayHeader
                headerText={`${translate('friendsFriendsScreen.otherFriends')} (${getCommonFriendsCount(
                  otherFriends,
                  displayedFriends,
                )})`}
              />
              {renderSearchResults(false)}
            </View>
          ) : (
            noUsersFound && (
              <Text style={styles.noResultsText}>
                {objKeys(friends).length > 0
                  ? `${translate('friendsFriendsScreen.noFriendsFound')}\n\n${translate(
                      'friendsFriendsScreen.trySearching',
                    )}`
                  : translate('friendsFriendsScreen.hasNoFriends')}
              </Text>
            )
          )}
        </View>
        <FillerView />
      </ScrollView>
    </ScreenWrapper>
  );
}

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  textContainer: {
    width: '95%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'center',
  },
  searchResultsContainer: {
    width: '100%',
    flexDirection: 'column',
    marginTop: 8,
  },
});

FriendsFriendsScreen.displayName = 'Friends Friends Screen';
export default FriendsFriendsScreen;
