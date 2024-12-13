import {Alert, View} from 'react-native';
import SearchWindow from '@components/Social/SearchWindow';
import type {
  SearchWindowRef,
  UserIDToNicknameMapping,
} from '@src/types/various/Search';
import React, {useEffect, useRef, useState} from 'react';
import {objKeys} from '@libs/DataHandling';
import {getNicknameMapping} from '@libs/SearchUtils';
import {searchArrayByText} from '@libs/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {UserArray} from '@src/types/onyx/OnyxCommon';
import UserListComponent from '@components/Social/UserListComponent';
import useProfileList from '@hooks/useProfileList';
import NoFriendInfo from '@components/Social/NoFriendInfo';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function FriendListScreen() {
  const {userData} = useDatabaseData();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const friendListInputRef = useRef<SearchWindowRef>(null);
  const [friends, setFriends] = useState<UserArray>([]);
  const [friendsToDisplay, setFriendsToDisplay] = useState<UserArray>([]);
  const {profileList} = useProfileList(friends);

  // eslint-disable-next-line @typescript-eslint/require-await
  const localSearch = async (searchText: string): Promise<void> => {
    try {
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
        translate('database.error.searchFailed'),
        `${translate('database.error.couldNotSearch')}: ${errorMessage}`,
      );
    }
  };

  const resetSearch = () => {
    setFriendsToDisplay(friends);
  };

  useEffect(() => {
    const friendsArray = objKeys(userData?.friends);
    setFriends(friendsArray);
    setFriendsToDisplay(friendsArray);
  }, [userData]);

  return (
    <View style={styles.flex1}>
      <SearchWindow
        ref={friendListInputRef}
        windowText={translate('friendListScreen.searchYourFriendList')}
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
export default FriendListScreen;
