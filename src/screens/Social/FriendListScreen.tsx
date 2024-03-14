import {
  Alert,
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingData from '../../components/LoadingData';
import UserOverview from '@components/Social/UserOverview';
import useProfileList from '@hooks/useProfileList';
import SearchWindow from '@components/Social/SearchWindow';
import {
  SearchWindowRef,
  UserIdToNicknameMapping,
  UserSearchResults,
} from '@src/types/various/Search';
import GeneralAction from '@src/types/various/GeneralAction';
import {useEffect, useMemo, useReducer, useRef} from 'react';
import {objKeys} from '@libs/DataHandling';
import {isNonEmptyArray} from '@libs/Validation';
import commonStyles from '@src/styles/commonStyles';
import {getNicknameMapping} from '@libs/SearchUtils';
import {searchArrayByText} from '@libs/Search';
import {
  calculateAllUsersPriority,
  orderUsersByPriority,
} from '@libs/algorithms/DisplayPriority';
import {UsersPriority} from '@src/types/various/Algorithms';
import FillerView from '@components/FillerView';
import PressableWithAnimation from '@components/Buttons/PressableWithAnimation';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {FriendList} from '@src/types/database';
import {useFirebase} from '@context/global/FirebaseContext';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import useRefresh from '@hooks/useRefresh';
import {RefreshControl} from 'react-native-gesture-handler';

interface State {
  searching: boolean;
  friends: FriendList | undefined;
  friendsToDisplay: UserSearchResults;
  usersPriority: UsersPriority;
  displayArray: string[]; // Main array to display
  scrolling: boolean;
}

const initialState: State = {
  searching: false,
  friends: undefined,
  friendsToDisplay: [],
  usersPriority: {},
  displayArray: [],
  scrolling: false,
};

const reducer = (state: State, action: GeneralAction): State => {
  switch (action.type) {
    case 'SET_SEARCHING':
      return {...state, searching: action.payload};
    case 'SET_FRIENDS':
      return {...state, friends: action.payload};
    case 'SET_FRIENDS_TO_DISPLAY':
      return {...state, friendsToDisplay: action.payload};
    case 'SET_USERS_PRIORITY':
      return {...state, usersPriority: action.payload};
    case 'SET_DISPLAY_ARRAY':
      return {...state, displayArray: action.payload};
    case 'SET_SCROLLING':
      return {...state, scrolling: action.payload};
    default:
      return state;
  }
};

type FriendListScreenProps = {
  setIndex: (index: number) => void;
};

const FriendListScreen = (props: FriendListScreenProps) => {
  const {setIndex} = props;
  const {auth} = useFirebase();
  const {userData, refetch} = useDatabaseData();
  const friendListInputRef = useRef<SearchWindowRef>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {onRefresh, refreshing, refreshCounter} = useRefresh({refetch});
  const {loadingDisplayData, profileList, userStatusList} = useProfileList(
    userData?.friends,
  );
  const user = auth.currentUser;

  const localSearch = async (searchText: string) => {
    try {
      dispatch({type: 'SET_SEARCHING', payload: true});
      let searchMapping: UserIdToNicknameMapping = getNicknameMapping(
        profileList,
        'display_name',
      );
      let relevantResults = searchArrayByText(
        objKeys(state.friends),
        searchText,
        searchMapping,
      );
      dispatch({type: 'SET_FRIENDS_TO_DISPLAY', payload: relevantResults}); // Hide irrelevant
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
    dispatch({type: 'SET_FRIENDS_TO_DISPLAY', payload: objKeys(state.friends)});
  };

  const navigateToProfile = (friendId: string): void => {
    Navigation.navigate(ROUTES.PROFILE.getRoute(friendId));
  };

  // Database data hooks
  useEffect(() => {
    refetch();
  }, [user?.uid]);

  useMemo(() => {
    dispatch({type: 'SET_FRIENDS', payload: userData?.friends});
  }, [userData]);

  useEffect(() => {
    if (state.friends && userStatusList) {
      let friendsArray = objKeys(state.friends);
      let newUsersPriority = calculateAllUsersPriority(
        friendsArray,
        userStatusList,
      );
      dispatch({type: 'SET_USERS_PRIORITY', payload: newUsersPriority});

      let newDisplayArray = orderUsersByPriority(
        friendsArray,
        newUsersPriority,
      );
      dispatch({type: 'SET_DISPLAY_ARRAY', payload: newDisplayArray});
    }
  }, [state.friends, userStatusList, userData]); // Dependency array includes anything that should trigger a re-order

  return (
    <View style={styles.mainContainer}>
      <SearchWindow
        ref={friendListInputRef}
        windowText="Search your friend list"
        onSearch={localSearch}
        onResetSearch={resetSearch}
        searchOnTextChange={true}
      />
      <ScrollView
        style={styles.scrollViewContainer}
        onScrollBeginDrag={() => {
          Keyboard.dismiss;
          dispatch({type: 'SET_SCROLLING', payload: true});
        }}
        keyboardShouldPersistTaps="handled"
        onScrollEndDrag={() =>
          dispatch({type: 'SET_SCROLLING', payload: false})
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh(['userData'])}
          />
        }>
        {loadingDisplayData ? (
          <LoadingData style={styles.loadingContainer} />
        ) : state.friends ? (
          <View style={styles.friendList}>
            {isNonEmptyArray(state.displayArray) ? (
              state.displayArray.map((friendId: string) => {
                const profileData = profileList[friendId];
                const userStatusData = userStatusList[friendId];

                return (
                  <PressableWithAnimation
                    key={friendId + '-button'}
                    style={styles.friendOverviewButton}
                    onPress={() => navigateToProfile(friendId)}>
                    <UserOverview
                      key={friendId + '-user-overview'}
                      userId={friendId}
                      profileData={profileData}
                      userStatusData={userStatusData}
                    />
                  </PressableWithAnimation>
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
        <FillerView height={100} />
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
