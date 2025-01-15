import {View} from 'react-native';
import SearchWindow from '@components/Social/SearchWindow';
import type {UserIDToNicknameMapping} from '@src/types/various/Search';
import React, {useCallback, useEffect, useState} from 'react';
import {objKeys} from '@libs/DataHandling';
import {getNicknameMapping, searchArrayByText} from '@libs/Search';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {UserArray} from '@src/types/onyx/OnyxCommon';
import * as ErrorUtils from '@libs/ErrorUtils';
import UserListComponent from '@components/Social/UserListComponent';
import useProfileList from '@hooks/useProfileList';
import NoFriendInfo from '@components/Social/NoFriendInfo';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ERRORS from '@src/ERRORS';

function FriendListScreen() {
  const {userData} = useDatabaseData();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const [friends, setFriends] = useState<UserArray>([]);
  const [friendsToDisplay, setFriendsToDisplay] = useState<UserArray>([]);
  const {profileList} = useProfileList(friends);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const localSearch = useCallback(
    (searchText: string): void => {
      try {
        setIsLoading(true);
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
        ErrorUtils.raiseAppError(ERRORS.DATABASE.SEARCH_FAILED, error);
      } finally {
        setIsLoading(false);
      }
    },
    [friends, profileList],
  );

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
        // ref={friendListInputRef}
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
        isLoading={isLoading}
      />
    </View>
  );
}
export default FriendListScreen;
