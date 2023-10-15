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
} from 'react-native';
import { FriendRequestStatus, NicknameToIdData } from '../../types/database';
import DatabaseContext from '../../context/DatabaseContext';
import { Database } from 'firebase/database';
import { searchDbByNickname } from '../../database/search';
import UserOverview from '../UserOverview';
import { getAuth } from 'firebase/auth';
import { getDatabaseData } from '../../context/DatabaseDataContext';
import { acceptFriendRequest, isFriend, sendFriendRequest } from '../../database/friends';

export type InputTextPopupProps = {
    visible: boolean;
    transparent: boolean;
    message: string;
    placeholder: string;
    onRequestClose: () => void;
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
    const [requestIds, setRequestIds] = useState<NicknameToIdData>({});
    const [requestStatuses, setRequestStatuses] = useState<FriendRequestStatus[]>([]);
    const [noUsersFound, setNoUsersFound] = useState<boolean>(false);

    const doSearch = async (db:Database, nickname:string):Promise<void> => {
        setNoUsersFound(false);
        try {
            const newRequestIds = await searchDbByNickname(db, nickname);
            if (newRequestIds) {
                updateSearchedUsersStatus(newRequestIds);
                setRequestIds(newRequestIds);
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
    const updateSearchedUsersStatus = (usersId: NicknameToIdData):void => {
      if (!usersId || !userData) return;
      let newUsersStatus = Object.keys(usersId).map((userId) => userData.friend_requests[userId])
      setRequestStatuses(newUsersStatus);
    };

    const handleCancelButtonPress = () => {
      // Reset all values displayed on screen
      onRequestClose();
      setSearchText('');
      setRequestIds({});
      setRequestStatuses([]);
      setNoUsersFound(false);
    };

    const statusToTextMap = {
      "sent": "Waiting for a response",
      "received": "Accept friend request",
    };

    function sendFriendRequestButton(
      db:Database, 
      index: number,
      userTo: string
    ) {
      const requestStatus = requestStatuses[index];
      const buttonText = requestStatus ? statusToTextMap[requestStatus] : "Send a request";
      const alreadyAFriend = userData?.friends[userTo];

      if (!user) return;

      return (
        // Refactor this part using AI later
        <View style={styles.sendFriendRequestContainer}>
          {alreadyAFriend ?
          <Text style={styles.sendFriendRequestText}>Already a friend</Text>
          : requestStatus === "sent" ?
          <Text style={styles.sendFriendRequestText}>Waiting for a response</Text>
          : requestStatus === "received" ?
          <TouchableOpacity 
            style={styles.acceptFriendRequestButton}
            onPress={() => acceptFriendRequest(db, user.uid, userTo)}
          >
            <Text style={styles.sendFriendRequestText}>Accept friend request</Text>
          </TouchableOpacity>
          :
          <TouchableOpacity 
            style={styles.sendFriendRequestButton}
            onPress={() => sendFriendRequest(db, user.uid, userTo)}
          >
            <Text style={styles.sendFriendRequestText}>Send friend request</Text>
          </TouchableOpacity>
          }
        </View>
      )
    };
  
    if (!db) return;

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
              :
              requestIds ?
              Object.keys(requestIds).map((userId, index) => (
                <UserOverview
                  index = {index}
                  userId = {userId}
                  RightSideComponent={sendFriendRequestButton(db, index, userId)}
                />
              ))
              :
              <></>
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


