import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SearchWindow from '@components/Social/SearchWindow';
import {
  SearchWindowRef,
  UserIdToNicknameMapping,
} from '@src/types/various/Search';
import GeneralAction from '@src/types/various/GeneralAction';
import React, {useMemo, useReducer, useRef} from 'react';
import {objKeys} from '@libs/DataHandling';
import {getNicknameMapping} from '@libs/SearchUtils';
import {searchArrayByText} from '@libs/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {UserArray} from '@src/types/database';
import UserListComponent from '@components/Social/UserListComponent';
import useProfileList from '@hooks/useProfileList';

interface State {
  searching: boolean;
  friends: UserArray;
  friendsToDisplay: UserArray;
}

const initialState: State = {
  searching: false,
  friends: [],
  friendsToDisplay: [],
};

const reducer = (state: State, action: GeneralAction): State => {
  switch (action.type) {
    case 'SET_SEARCHING':
      return {...state, searching: action.payload};
    case 'SET_FRIENDS':
      return {...state, friends: action.payload};
    case 'SET_FRIENDS_TO_DISPLAY':
      return {...state, friendsToDisplay: action.payload};
    default:
      return state;
  }
};

type FriendListScreenProps = {
  setIndex: (index: number) => void;
};

const FriendListScreen = (props: FriendListScreenProps) => {
  const {setIndex} = props;
  const {userData} = useDatabaseData();
  const friendListInputRef = useRef<SearchWindowRef>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {profileList} = useProfileList(state.friends);

  const localSearch = async (searchText: string) => {
    try {
      dispatch({type: 'SET_SEARCHING', payload: true});
      let searchMapping: UserIdToNicknameMapping = getNicknameMapping(
        profileList,
        'display_name',
      );
      let relevantResults = searchArrayByText(
        state.friends,
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
    dispatch({type: 'SET_FRIENDS_TO_DISPLAY', payload: state.friends});
  };

  const EmptyList: React.FC = () => {
    return (
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
    );
  };

  useMemo(() => {
    let friendsArray = objKeys(userData?.friends);
    dispatch({type: 'SET_FRIENDS', payload: friendsArray});
    dispatch({type: 'SET_FRIENDS_TO_DISPLAY', payload: friendsArray});
  }, [userData]);

  return (
    <View style={styles.mainContainer}>
      <SearchWindow
        ref={friendListInputRef}
        windowText="Search your friend list"
        onSearch={localSearch}
        onResetSearch={resetSearch}
        searchOnTextChange={true}
      />
      <UserListComponent
        fullUserArray={state.friends}
        initialLoadSize={15}
        emptyListComponent={<EmptyList />}
        userSubset={state.friendsToDisplay}
        orderUsers={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
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

export default FriendListScreen;
