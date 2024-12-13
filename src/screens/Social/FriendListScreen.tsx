import {Alert, StyleSheet, View} from 'react-native';
import SearchWindow from '@components/Social/SearchWindow';
import type {
  SearchWindowRef,
  UserIDToNicknameMapping,
} from '@src/types/various/Search';
import React, {useMemo, useRef, useState} from 'react';
import {objKeys} from '@libs/DataHandling';
import {getNicknameMapping} from '@libs/SearchUtils';
import {searchArrayByText} from '@libs/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {UserArray} from '@src/types/onyx/OnyxCommon';
import UserListComponent from '@components/Social/UserListComponent';
import useProfileList from '@hooks/useProfileList';
import NoFriendInfo from '@components/Social/NoFriendInfo';

function FriendListScreen() {
  const {userData} = useDatabaseData();
  const friendListInputRef = useRef<SearchWindowRef>(null);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<UserArray>([]);
  const [friendsToDisplay, setFriendsToDisplay] = useState<UserArray>([]);
  const {profileList} = useProfileList(friends);

  const localSearch = (searchText: string) => {
    try {
      setSearching(true);
      const searchMapping: UserIDToNicknameMapping = getNicknameMapping(
        profileList,
        'display_name',
      );
      const relevantResults = searchArrayByText(
        friends,
        searchText,
        searchMapping,
      );
      setFriendsToDisplay(relevantResults); // Hide irrelevant
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      Alert.alert(
        'Database serach failed',
        `Could not search the database: ${errorMessage}`,
      );
      return;
    } finally {
      setSearching(false);
    }
  };

  const resetSearch = () => {
    setFriendsToDisplay(friends);
  };

  useMemo(() => {
    const friendsArray = objKeys(userData?.friends);
    setFriends(friendsArray);
    setFriendsToDisplay(friendsArray);
  }, [userData]);

  return (
    <View style={styles.mainContainer}>
      <SearchWindow
        ref={friendListInputRef}
        windowText="Search your friend list"
        onSearch={localSearch}
        onResetSearch={resetSearch}
        searchOnTextChange
      />
      <UserListComponent
        fullUserArray={friends}
        initialLoadSize={20}
        emptyListComponent={<NoFriendInfo />}
        userSubset={friendsToDisplay}
        orderUsers
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export default FriendListScreen;
