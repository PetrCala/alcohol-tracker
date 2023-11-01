import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FriendRequestStatus, UserData, NicknameToIdData } from '../../types/database';
import { useState } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { acceptFriendRequest, deleteFriendRequest, sendFriendRequest } from '../../database/friends';
import { auth } from "../../../firebaseConfig";
import { isNonEmptyObject } from '../../utils/validation';
import useProfileDisplayData from '../../hooks/useProfileDisplayData';
import LoadingData from '../../components/LoadingData';
import { Database } from 'firebase/database';
import FillerView from '../../components/FillerView';
import { searchDbByNickname } from '../../database/search';

type SearchResultProps = {
  userId: string;
  displayData: any;
  db: Database;
  userFrom: string;
  requestStatus: FriendRequestStatus | undefined;
  alreadyAFriend: boolean;
};

const SearchResult: React.FC<SearchResultProps> = ({
  userId,
  displayData,
  db,
  userFrom,
  requestStatus,
  alreadyAFriend,
}) => {
  return (
    <View style={styles.userOverviewContainer}>
      <View style={styles.userInfoContainer}>
        <Image
          style={styles.userProfileImage}
          source={
            displayData[userId]?.photo_url && displayData[userId]?.photo_url !== ''
              ? { uri: displayData[userId].photo_url }
              : require('../../../assets/temp/user.png')
          }
        />
        <Text style={styles.userNicknameText}>
          {displayData[userId]?.display_name ? displayData[userId].display_name : "Unknown"}
        </Text>
      </View>
      <SendFriendRequestButton
        db={db}
        userFrom={userFrom}
        userTo={userId}
        requestStatus={requestStatus}
        alreadyAFriend={alreadyAFriend}
      />
    </View>
  );
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
        onPress={() => sendFriendRequest(db, userFrom, userTo)} // Also refresh the status!!
      >
        <Text style={styles.sendFriendRequestText}>{statusToTextMap.undefined}</Text>
      </TouchableOpacity>
      }
    </View>
  )
};

type ScreenProps = {
  userData: UserData | null;
}

const SearchScreen = (props:ScreenProps) => {
  const {userData} = props;
  const { db } = useFirebase();
  const user = auth.currentUser;
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

  const resetSearch = () => {
    // Reset all values displayed on screen
    setSearchText('');
    setSearchResultData({});
    setRequestStatuses([]);
    setDisplayData({});
    setNoUsersFound(false);
  };

  if (!db || !user) return;

  return (
  <View style={styles.mainContainer}>
    <ScrollView 
      style={styles.scrollViewContainer}
      keyboardShouldPersistTaps="handled"
    >
        <Text style={styles.searchInfoText}>Search users</Text>
        <View style={styles.textContainer}>
            <TextInput
                placeholder="Nickname"
                value={searchText}
                onChangeText={text => setSearchText(text)}
                style={styles.searchText}
                keyboardType="default"
                textContentType="nickname"
            />
            {searchText !== '' ? 
                <TouchableOpacity 
                onPress={() => resetSearch()}
                style={styles.searchTextResetContainer}
                >
                <Image
                style={styles.searchTextResetImage}
                source={require('../../../assets/icons/thin_x.png')}
                />
                </TouchableOpacity>
                :
                <></>
            }
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
            loadingDisplayData ? (
              <LoadingData key={userId+'-loading'}/>
            ) : (
              <SearchResult
                key={userId + '-container'}
                userId={userId}
                displayData={displayData}
                db={db}
                userFrom={user.uid}
                requestStatus={requestStatuses[index]}
                alreadyAFriend={userData?.friends ? userData?.friends[userId] : false}
              />
            )
        ))
        :
        <></> // Some users found, but searchResults empty - should not happen
        }
        </View>
    </ScrollView>
  </View>
  );
};


export default SearchScreen;

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  searchResultsView: {
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
  searchInfoText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    marginTop: 10,
  },
  textContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  searchText: {
    height: '100%',
    width: '90%',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  searchTextResetContainer: {
    width: '10%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTextResetImage: {
    width: 15,
    height: 15,
    tintColor: 'gray',
  },
  searchButtonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  searchResultsContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  searchButton: {
    width: '100%',
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
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
    marginTop: 5,
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
    padding: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5
  },
  userNicknameText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 10,
  },
  userProfileImage: {
    width: 70,
    height: 70,
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
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    padding: 5,
  },
});

