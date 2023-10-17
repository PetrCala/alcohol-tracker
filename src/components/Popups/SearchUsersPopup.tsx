import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput,
  TouchableOpacity, 
  StyleSheet,
  KeyboardTypeOptions,
  Alert,
  Image, 
} from 'react-native';
import { ProfileDisplayData, FriendRequestStatus, NicknameToIdData, ProfileData } from '../../types/database';
import DatabaseContext from '../../context/DatabaseContext';
import { Database } from 'firebase/database';
import { searchDbByNickname } from '../../database/search';
import UserOverview from '../UserOverview';
import { getAuth } from 'firebase/auth';
import { getDatabaseData } from '../../context/DatabaseDataContext';
import { acceptFriendRequest, isFriend, sendFriendRequest } from '../../database/friends';
import { isNonEmptyObject } from '../../utils/validation';
import { fetchUserProfiles } from '../../database/profile';
import LoadingData from '../LoadingData';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';

export type InputTextPopupProps = {
    visible: boolean;
    transparent: boolean;
    message: string;
    placeholder: string;
    onRequestClose: () => void;
};

type SendFriendRequestButtonProps = {
  db:Database, 
  userFrom: string,
  userTo: string,
  requestStatus: FriendRequestStatus | undefined;
  alreadyAFriend: boolean;
}

const SendFriendRequestButton: React.FC<SendFriendRequestButtonProps> = ({
  db,
  userFrom,
  userTo,
  requestStatus,
  alreadyAFriend
}) => {
  
  const statusToTextMap = {
    "self": "You",
    "friend" :"Already a friend",
    "sent": "Awaiting a response",
    "received": "Accept friend request",
    "undefined": "Send a request",
  };

  return (
    // Refactor this part using AI later
    <View style={styles.sendFriendRequestContainer}>
      {userFrom === userTo ?
      <Text style={styles.sendFriendRequestText}>{statusToTextMap.self}</Text>
      : alreadyAFriend ?
      <Text style={styles.sendFriendRequestText}>{statusToTextMap.friend}</Text>
      : requestStatus === "sent" ?
      <Text style={styles.sendFriendRequestText}>{statusToTextMap.sent}</Text>
      : requestStatus === "received" ?
      <TouchableOpacity 
        style={styles.acceptFriendRequestButton}
        onPress={() => acceptFriendRequest(db, userFrom, userTo)}
      >
        <Text style={styles.sendFriendRequestText}>{statusToTextMap.received}</Text>
      </TouchableOpacity>
      :
      <TouchableOpacity 
        style={styles.sendFriendRequestButton}
        onPress={() => sendFriendRequest(db, userFrom, userTo)}
      >
        <Text style={styles.sendFriendRequestText}>{statusToTextMap.undefined}</Text>
      </TouchableOpacity>
      }
    </View>
  )
};

const SearchUsersPopup = (props: InputTextPopupProps) => {
    const { 
        visible, 
        transparent, 
        message, 
        placeholder,
        onRequestClose, 
    } = props;
    const db = useContext(DatabaseContext);
    const auth = getAuth();
    const user = auth.currentUser;
    const { userData } = getDatabaseData();
    const [searchText, setSearchText] = useState<string>('');
    const [searchResultData, setSearchResultData] = useState<NicknameToIdData>({});
    const [requestStatuses, setRequestStatuses] = useState<(FriendRequestStatus | undefined)[]>([]);
    const [noUsersFound, setNoUsersFound] = useState<boolean>(false);
    const [loadingDisplayData, setLoadingDisplayData] = useState<boolean>(false);
    const [displayData, setDisplayData] = useProfileDisplayData({
      data: searchResultData,
      db: db,
      setLoadingDisplayData: setLoadingDisplayData
    });

    const doSearch = async (db:Database, nickname:string):Promise<void> => {
        if (!db || !nickname) return; // Input a value first alert
        setNoUsersFound(false);
        try {
            const newSearchResults = await searchDbByNickname(db, nickname); // Cleaned within the function
            if (newSearchResults) {
                setSearchResultData(newSearchResults);
                updateSearchedUsersStatus(newSearchResults);
            } else {
                setNoUsersFound(true);
            };
        } catch (error:any) {
            Alert.alert("Database serach failed", "Could not search the database: " + error.message);
            return;
        };
    };

    /** Having a list of users returned by the search,
     * determine the request status for each and update
     * the UsersStatus hook.
     */
    const updateSearchedUsersStatus = (searchData: NicknameToIdData):void => {
      if (!userData) return;
      let newUsersStatus:(FriendRequestStatus | undefined)[] = [];
      if (isNonEmptyObject(searchData)) {
        newUsersStatus = Object.keys(searchData).map((userId) => userData?.friend_requests ? userData.friend_requests[userId] : undefined)
      }
      setRequestStatuses(newUsersStatus);
    };

    const handleCancelButtonPress = () => {
      // Reset all values displayed on screen
      onRequestClose();
      setSearchText('');
      setSearchResultData({});
      setRequestStatuses([]);
      setDisplayData({});
      setNoUsersFound(false);
    };

    if (!db || !user) return;

    return (
      <Modal
      animationType="none"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}
      >
        <View style={styles.modalContainer}>
        <View style={styles.modalView}>
            <Text style={styles.modalText}>
            {message}
            </Text>
            <View style={styles.textContainer}>
              <TextInput
                  placeholder={placeholder}
                  value={searchText}
                  onChangeText={text => setSearchText(text)}
                  style={styles.searchText}
                  keyboardType="default"
                  textContentType="nickname"
              />
            </View>
            <View style={styles.searchButtonContainer}>
                <TouchableOpacity style={styles.searchButton} onPress={() => doSearch(db, searchText)}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.searchResultsContainer}>
              {noUsersFound ?
                <Text style={styles.noUsersFoundText}>
                  There are no users with this nickname.
                </Text>
              : isNonEmptyObject(searchResultData) ?
              Object.keys(searchResultData).map((userId, index) => (
                loadingDisplayData ?
                <LoadingData key={userId+'-loading'}/> :
                // Perhaps abstract away the following into SearchResult
                <View key={userId+'-container'} style={styles.userOverviewContainer}>
                  <View key={userId+'-profile'} style={styles.userInfoContainer}>
                    <Image
                      key={userId+'-profile-icon'}
                      style={styles.userProfileImage}
                      source={
                        displayData[userId]?.photo_url && displayData[userId]?.photo_url !== '' ?
                        {uri: displayData[userId].photo_url}:
                        require('../../../assets/temp/user.png')
                      }
                    />
                    <Text 
                      key={userId+'-nickname'}
                      style={styles.userNicknameText}
                    >
                    {displayData[userId]?.display_name ? displayData[userId].display_name : "Unknown"}
                    </Text>
                  </View>
                  <SendFriendRequestButton 
                    key={userId+'-request-button'}
                    db={db}
                    userFrom={user.uid}
                    userTo={userId}
                    requestStatus={requestStatuses[index]}
                    alreadyAFriend={userData?.friends ? userData?.friends[userId] : false}
                  />
                </View>
              ))
              :
              <></> // Some users found, but searchResults empty - should not happen
              }
            </View>
            <View style={styles.cancelButtonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelButtonPress}>
                    <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
        </View>
      </Modal>
    );
};

export default SearchUsersPopup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This will fade the background
  },
  modalView: {
    width: '90%',
    flexDirection: 'column',
    backgroundColor: '#FFFF99',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    padding: 15,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
  },
  textContainer: {
    width: '100%',
    height: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  searchButtonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  searchText: {
    height: '100%',
    width: '100%',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  searchResultsContainer: {
    width: '100%',
    flexDirection: 'column',
    padding: 2,
  },
  searchButton: {
    width: '100%',
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 5,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 15,
  },
  noUsersFoundText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#ffff99',
    padding: 6,
    margin: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 2,
    padding: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  userNicknameText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 5,
  },
  userProfileImage: {
    width: 30,
    height: 30,
    padding: 5,
  },
  sendFriendRequestContainer: {
    width: 'auto',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  sendFriendRequestButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  acceptFriendRequestButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  sendFriendRequestText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    padding: 5,
  },
});