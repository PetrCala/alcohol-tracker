import {Alert, StyleSheet, View} from 'react-native';
import type {
  FriendRequestList,
  FriendRequestStatus,
  ProfileList,
} from '@src/types/onyx';
import Text from '@components/Text';
import type {UserList} from '@src/types/onyx/OnyxCommon';
import React, {useMemo, useRef, useState} from 'react';
import {useFirebase} from '@src/context/global/FirebaseContext';
import {isNonEmptyArray} from '@libs/Validation';
import type {Database} from 'firebase/database';
import {searchDatabaseForUsers} from '@libs/Search';
import {fetchUserProfiles} from '@database/profile';
import SearchResult from '@components/Social/SearchResult';
import SearchWindow from '@components/Social/SearchWindow';
import type {
  SearchWindowRef,
  UserSearchResults,
} from '@src/types/various/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import Navigation from '@libs/Navigation/Navigation';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import ScrollView from '@components/ScrollView';

function FriendSearchScreen() {
  const {auth, db, storage} = useFirebase();
  const styles = useThemeStyles();
  const {userData} = useDatabaseData();
  const searchInputRef = useRef<SearchWindowRef>(null);
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const [searchResultData, setSearchResultData] = useState<UserSearchResults>(
    [],
  );
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<UserList | undefined>(undefined);
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestList | undefined
  >(undefined);
  const [requestStatuses, setRequestStatuses] = useState<
    Record<string, FriendRequestStatus | undefined>
  >({});
  const [noUsersFound, setNoUsersFound] = useState(false);
  const [displayData, setDisplayData] = useState<ProfileList>({});

  const dbSearch = async (searchText: string, db?: Database): Promise<void> => {
    try {
      setSearching(true);
      const searchResultData: UserSearchResults = await searchDatabaseForUsers(
        db,
        searchText,
      );
      await updateHooksBasedOnSearchResults(searchResultData);
      setSearchResultData(searchResultData);
    } catch (error: any) {
      Alert.alert(
        'Database serach failed',
        'Could not search the database: ' + error.message,
      );
      return;
    } finally {
      setSearching(false);
    }
  };

  const updateDisplayData = async (
    searchResultData: UserSearchResults,
  ): Promise<void> => {
    const newDisplayData: ProfileList = await fetchUserProfiles(
      db,
      searchResultData,
    );
    setDisplayData(newDisplayData);
  };

  /** Having a list of users returned by the search,
   * determine the request status for each and update
   * the RequestStatuses hook.
   */
  const updateRequestStatuses = (
    data: UserSearchResults = searchResultData,
  ): void => {
    const newRequestStatuses: Record<string, FriendRequestStatus> = {};
    data.forEach(userID => {
      if (friendRequests?.[userID]) {
        newRequestStatuses[userID] = friendRequests[userID];
      }
    });
    setRequestStatuses(newRequestStatuses);
  };

  const updateHooksBasedOnSearchResults = async (
    searchResults: UserSearchResults,
  ): Promise<void> => {
    updateRequestStatuses(searchResults); // Perhaps redundant
    await updateDisplayData(searchResults); // Assuming this returns a Promise
    const noUsersFound = !isNonEmptyArray(searchResults);
    setNoUsersFound(noUsersFound);
  };

  const resetSearch = (): void => {
    // Reset all values displayed on screen
    setSearching(false);
    setSearchResultData([]);
    setRequestStatuses({});
    setDisplayData({});
    setNoUsersFound(false);
  };

  useMemo(() => {
    if (userData) {
      setFriends(userData.friends);
      setFriendRequests(userData.friend_requests);
    }
  }, [userData]);

  useMemo(() => {
    updateRequestStatuses();
  }, [friendRequests]); // When updated in the database, not locally

  if (!user) {
    return;
  }

  return (
    <ScreenWrapper testID={FriendSearchScreen.displayName}>
      <HeaderWithBackButton
        title={translate('friendSearchScreen.title')}
        onBackButtonPress={Navigation.goBack}
      />
      <SearchWindow
        ref={searchInputRef}
        windowText="Search for new friends"
        onSearch={dbSearch}
        onResetSearch={resetSearch}
      />
      <View style={localStyles.mainContainer}>
        <ScrollView>
          <View style={localStyles.searchResultsContainer}>
            {searching ? (
              <FlexibleLoadingIndicator style={localStyles.loadingData} />
            ) : isNonEmptyArray(searchResultData) ? (
              searchResultData.map(userID => (
                <SearchResult
                  key={userID + '-container'}
                  userID={userID}
                  userDisplayData={displayData[userID]}
                  db={db}
                  storage={storage}
                  userFrom={user.uid}
                  requestStatus={requestStatuses[userID]}
                  alreadyAFriend={friends ? friends[userID] : false}
                />
              ))
            ) : (
              noUsersFound && (
                <Text style={styles.noResultsText}>
                  {translate('friendSearchScreen.noUsersFound')}
                </Text>
              )
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  loadingData: {
    marginTop: 20,
  },
  textContainer: {
    width: '95%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'center',
  },
  searchText: {
    height: '100%',
    width: '90%',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  searchTextResetContainer: {
    width: '10%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTextResetImage: {
    width: 15,
    height: 15,
    tintColor: 'gray',
  },
  searchResultsContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  searchButton: {
    width: '100%',
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  noUsersFoundText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
});

FriendSearchScreen.displayName = 'Friend Search Screen';
export default FriendSearchScreen;
