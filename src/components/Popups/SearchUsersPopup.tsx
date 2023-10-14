import React, { useContext, useState } from 'react';
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
import { NicknameToIdData } from '../../types/database';
import DatabaseContext from '../../context/DatabaseContext';
import { Database } from 'firebase/database';
import { searchDbByNickname } from '../../database/search';
import UserOverview from '../UserOverview';

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
    const [searchText, setSearchText] = useState<string>('');
    const [userIds, setUserIds] = useState<NicknameToIdData>({});
    const [noUsersFound, setNoUsersFound] = useState<boolean>(false);

    const doSearch = async (db:Database, nickname:string):Promise<void> => {
        setNoUsersFound(false);
        try {
            const newUserIds = await searchDbByNickname(db, nickname);
            if (newUserIds) {
                setUserIds(newUserIds);
            } else {
                setNoUsersFound(true);
            };
        } catch (error:any) {
            Alert.alert("Database serach failed", "Could not search the database: " + error.message);
            return;
        };
    };

    const handleCancelButtonPress = () => {
      // Reset all values displayed on screen
      onRequestClose();
      setSearchText('');
      setUserIds({});
      setNoUsersFound(false);
    };

    const doSendFriendRequest = (
      db: Database, 
      userFrom: string, 
      userTo: string) => {
        // Before sending a request, make sure that the request
        // has not been sent already. If it indeed has not, the
        // sendFriendRequst function can be called as is.
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
              userIds ?
              Object.keys(userIds).map((userId, index) => (
                <UserOverview
                  index = {index}
                  userId = {userId}
                />
                // Either add a modal for sending the request, or a button to the right of the overview
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
});


