import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ProfileData} from '../../types/database';
import LoadingData from '../../components/LoadingData';
import UserOverview from '@components/Social/UserOverview';
import useProfileDisplayData from '@hooks/useProfileDisplayData';
import SearchWindow from '@components/Social/SearchWindow';
import {Database} from 'firebase/database';
import {SearchWindowRef, UserSearchResults} from '@src/types/search';
import {GeneralAction} from '@src/types/states';
import {useMemo, useReducer, useRef} from 'react';
import {searchDatabaseForUsers} from '@database/search';
import {objKeys} from '@src/utils/dataHandling';
import {isNonEmptyArray} from '@src/utils/validation';
import commonStyles from '@src/styles/commonStyles';
import {FriendListScreenProps} from '@src/types/screens';

interface State {
  searching: boolean;
  displayedFriends: UserSearchResults;
}

const initialState: State = {
  searching: false,
  displayedFriends: [],
};

const reducer = (state: State, action: GeneralAction): State => {
  switch (action.type) {
    case 'SET_SEARCHING':
      return {...state, searching: action.payload};
    case 'SET_DISPLAYED_FRIENDS':
      return {...state, displayedFriends: action.payload};
    default:
      return state;
  }
};

const FriendListScreen = (props: FriendListScreenProps) => {
  const {navigation, friends, setIndex} = props;
  const {loadingDisplayData, profileDisplayData, userStatusDisplayData} =
    useProfileDisplayData(friends);
  const friendListInputRef = useRef<SearchWindowRef>(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  const doSearch = async (db: Database, searchText: string) => {
    try {
      dispatch({type: 'SET_SEARCHING', payload: true});
      let searchResultData: UserSearchResults = await searchDatabaseForUsers(
        db,
        searchText,
      );
      let relevantResults = searchResultData.filter(userId =>
        objKeys(friends).includes(userId),
      );
      dispatch({type: 'SET_DISPLAYED_FRIENDS', payload: relevantResults}); // Hide irrelevant
    } catch (error: any) {
      Alert.alert(
        'Database serach failed',
        'Could not search the database: ' + error.message,
      );
      return;
    } finally {
      dispatch({type: 'SET_SEARCHING', payload: false});
    }
  };

  const resetSearch = () => {
    dispatch({type: 'SET_DISPLAYED_FRIENDS', payload: objKeys(friends)});
  };

  const navigateToProfile = (
    friendId: string,
    profileData: ProfileData,
  ): void => {
    navigation.navigate('Profile Screen', {
      userId: friendId,
      profileData: profileData,
      friends: null, // Fetch on render
      currentUserFriends: friends,
      drinkingSessionData: null, // Fetch on render
      preferences: null, // Fetch on render
    });
  };

  useMemo(() => {
    dispatch({type: 'SET_DISPLAYED_FRIENDS', payload: objKeys(friends)});
  }, [friends]);

  if (!navigation) return null;

  return (
    <View style={styles.mainContainer}>
      <SearchWindow
        ref={friendListInputRef}
        doSearch={doSearch}
        onResetSearch={resetSearch}
      />
      <ScrollView
        style={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled">
        {loadingDisplayData ? (
          <LoadingData style={styles.loadingContainer} />
        ) : friends ? (
          <View style={styles.friendList}>
            {isNonEmptyArray(state.displayedFriends) ? (
              Object.keys(friends).map(friendId => {
                if (!state.displayedFriends.includes(friendId)) return null; // Hide irrelevant
                const profileData = profileDisplayData[friendId];
                const userStatusData = userStatusDisplayData[friendId];

                return (
                  <TouchableOpacity
                    key={friendId + '-button'}
                    style={styles.friendOverviewButton}
                    onPress={() => navigateToProfile(friendId, profileData)}>
                    <UserOverview
                      key={friendId + '-user-overview'}
                      userId={friendId}
                      profileData={profileData}
                      userStatusData={userStatusData}
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={commonStyles.noUsersFoundText}>
                {`No friends found.\n\nTry modifying the search text.`}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>
              You do not have any friends yet
            </Text>
            <TouchableOpacity
              onPress={() => setIndex(1)}
              style={styles.navigateToSearchButton}>
              <Text style={styles.navigateToSearchText}>Add them here</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FriendListScreen;

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  scrollViewContainer: {
    flex: 1,
    // backgroundColor: 'white',
    // justifyContent: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: screenHeight * 0.8,
  },
  friendList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: 5,
  },
  friendOverviewButton: {
    width: '100%',
    backgroundColor: 'white',
  },
  emptyList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '400',
    padding: 20,
  },
  navigateToSearchButton: {
    width: 150,
    height: 50,
    backgroundColor: 'white',
    padding: 5,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateToSearchText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});
