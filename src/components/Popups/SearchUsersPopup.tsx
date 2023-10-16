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
import { FriendRequestDisplayData, FriendRequestStatus, NicknameToIdData, ProfileData } from '../../types/database';
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

export type InputTextPopupProps = {
    visible: boolean;
    transparent: boolean;
    message: string;
    placeholder: string;
    onRequestClose: () => void;
};

type SendFriendRequestButtonProps = {
  db:Database, 
  index: number,
  userFrom: string,
  userTo: string,
  requestStatus: FriendRequestStatus | undefined;
  alreadyAFriend: boolean;
}

const SendFriendRequestButton: React.FC<SendFriendRequestButtonProps> = ({
  db,
  index,
  userFrom,
  userTo,
  requestStatus,
  alreadyAFriend
}) => {
  const statusToTextMap = {
    "friend" :"Already a friend",
    "sent": "Waiting for a response",
    "received": "Accept friend request",
    "undefined": "Send a friend request",
  };
  return (
    // Refactor this part using AI later
    <View style={styles.sendFriendRequestContainer}>
      {alreadyAFriend ?
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
    const [displayData, setDisplayData] = useState<FriendRequestDisplayData>({});
    const [loadingDisplayData, setLoadingDisplayData] = useState<boolean>(false);

    const doSearch = async (db:Database, nickname:string):Promise<void> => {
        if (!db || !nickname) return; // Input a value first alert
        setNoUsersFound(false);
        try {
            const newSearchResults = await searchDbByNickname(db, nickname);
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

    useEffect(() => {
      const fetchDisplayData = async () => {
      if (!db || !isNonEmptyObject(searchResultData)) {
        setDisplayData({});
        return;
      };
      const newDisplayData:FriendRequestDisplayData = {};
      setLoadingDisplayData(true);
      try {
        const searchResultIds = Object.keys(searchResultData);
        const userProfiles:ProfileData[] = await fetchUserProfiles(db, searchResultIds);
        searchResultIds.forEach((userId, index) => {
          newDisplayData[userId] = userProfiles[index];
        });
      } catch (error:any) {
        Alert.alert(
          "Database connection failed", 
          "Could not fetch the profile data associated with the displayed search results: " + error.message
        );
      } finally {
        setDisplayData(newDisplayData);
        setLoadingDisplayData(false);
      };
    };
    fetchDisplayData();
    }, [searchResultData]);
  
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
              : isNonEmptyObject(searchResultData) || !loadingDisplayData ?
              Object.keys(searchResultData).map((userId, index) => (
                <View style={styles.userOverviewContainer}>
                  <Text style={styles.userNicknameText}>{displayData?.userId?.display_name}</Text>
                  <Image
                    style={styles.userProfileImage}
                    source={displayData?.userId?.photo_url && displayData?.userId?.photo_url !== '' ?
                      require(displayData.userId.photo_url) :
                      require('../../../assets/temp/user.png')
                    }
                  />
                  <SendFriendRequestButton 
                    db={db}
                    index={index}
                    userFrom={user.uid}
                    userTo={userId}
                    requestStatus={requestStatuses[index]}
                    alreadyAFriend={userData?.friends ? userData?.friends[userId] : false}
                  />
                </View>
              ))
              :
              <LoadingData loadingText=''/>
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
    width: '80%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 2,
    padding: 2,
  },
  userNicknameText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '400',
  },
  userProfileImage: {
    width: 25,
    height: 25,
    padding: 5,
  },
  sendFriendRequestContainer: {
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  sendFriendRequestButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  acceptFriendRequestButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  sendFriendRequestText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'black',
    textAlign: 'center',
  },
});