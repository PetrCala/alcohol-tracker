// TODO translate
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  FriendRequestList,
  FriendRequestStatus,
  ProfileList,
} from '@src/types/onyx';
import {useEffect, useMemo, useState} from 'react';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useFirebase} from '@context/global/FirebaseContext';
import {acceptFriendRequest, deleteFriendRequest} from '@database/friends';
import type {Database} from 'firebase/database';
import NoFriendUserOverview from '@components/Social/NoFriendUserOverview';
import * as Profile from '@userActions/Profile';
import headerStyles from '@src/styles/headerStyles';
import GrayHeader from '@components/Header/GrayHeader';
import {objKeys} from '@libs/DataHandling';
import CONST from '@src/CONST';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import NoFriendInfo from '@components/Social/NoFriendInfo';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import ScrollView from '@components/ScrollView';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type RequestIdProps = {
  requestId: string;
};

type FriendRequestComponentProps = {
  requestStatus: FriendRequestStatus | undefined;
  requestId: string;
};

type FriendRequestItemProps = {
  requestId: string;
  friendRequests: FriendRequestList | undefined;
  displayData: ProfileList;
};

const handleAcceptFriendRequest = async (
  db: Database,
  userID: string,
  requestId: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<void> => {
  try {
    setIsLoading(true);
    await acceptFriendRequest(db, userID, requestId);
    setIsLoading(false);
  } catch (error: unknown) {
    Alert.alert(
      'User does not exist in the database',
      `Could not accept the friend request: ${error.message}`,
    );
  }
};

const handleRejectFriendRequest = async (
  db: Database,
  userID: string,
  requestId: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<void> => {
  try {
    setIsLoading(true);
    await deleteFriendRequest(db, userID, requestId);
    setIsLoading(false);
  } catch (error: unknown) {
    Alert.alert(
      'User does not exist in the database',
      `Could not accept the friend request: ${error.message}`,
    );
  }
};

// Component to be shown for a received friend request
const FriendRequestButtons: React.FC<RequestIdProps> = ({requestId}) => {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  if (!user) {
    return;
  }

  return (
    <View style={localStyles.friendRequestButtonsContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        key={`${requestId}-accept-request-button`}
        style={[
          localStyles.handleRequestButton,
          localStyles.acceptRequestButton,
        ]}
        onPress={() =>
          handleAcceptFriendRequest(db, user.uid, requestId, setIsLoading)
        }>
        {isLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Text style={localStyles.handleRequestButtonText}>Accept</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        key={`${requestId}-reject-request-button`}
        style={[
          localStyles.handleRequestButton,
          localStyles.rejectRequestButton,
        ]}
        onPress={() =>
          handleRejectFriendRequest(db, user.uid, requestId, setIsLoading)
        }>
        <Text style={localStyles.handleRequestButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component to be shown when the friend request is pending
const FriendRequestPending: React.FC<RequestIdProps> = ({requestId}) => {
  const {auth, db} = useFirebase();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  return (
    <View style={localStyles.friendRequestPendingContainer}>
      <Button
        danger
        onPress={() =>
          handleRejectFriendRequest(db, user.uid, requestId, setIsLoading)
        }
        text={translate('common.cancel')}
        isLoading={isLoading}
      />
    </View>
  );
};

// Component to be rendered on the right hand side of each friend request container
const FriendRequestComponent: React.FC<FriendRequestComponentProps> = ({
  requestStatus,
  requestId,
}) => {
  return requestStatus === CONST.FRIEND_REQUEST_STATUS.RECEIVED ? (
    <FriendRequestButtons
      key={`${requestId}-friend-request-buttons`}
      requestId={requestId}
    />
  ) : requestStatus === CONST.FRIEND_REQUEST_STATUS.SENT ? (
    <FriendRequestPending
      key={`${requestId}-friend-request-pending`}
      requestId={requestId}
    />
  ) : null;
};

const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
  requestId,
  friendRequests,
  displayData,
}) => {
  if (!friendRequests || !displayData) {
    return null;
  }
  const profileData = displayData[requestId];
  const requestStatus = friendRequests[requestId];

  return (
    <NoFriendUserOverview
      key={`${requestId}-friend-request`}
      userID={requestId}
      profileData={profileData}
      RightSideComponent={FriendRequestComponent({
        requestId,
        requestStatus,
      })}
    />
  );
};

function FriendRequestScreen() {
  const {db} = useFirebase();
  const {userData} = useDatabaseData();
  const theme = useTheme();
  const [loadingText] = useOnyx(ONYXKEYS.APP_LOADING_TEXT);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestList | undefined
  >();
  const [displayData, setDisplayData] = useState<ProfileList>({});
  const [requestsSent, setRequestsSent] = useState<string[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<string[]>([]);
  const [requestsSentCount, setRequestsSentCount] = useState<number>(0);
  const [requestsReceivedCount, setRequestsReceivedCount] = useState<number>(0);

  useMemo(() => {
    if (userData) {
      setFriendRequests(userData?.friend_requests);
    }
  }, [userData]);

  const updateDisplayData = async (
    db: Database,
    friendRequests: FriendRequestList | undefined,
  ): Promise<void> => {
    const newDisplayData: ProfileList = await Profile.fetchUserProfiles(
      db,
      objKeys(friendRequests),
    );
    setDisplayData(newDisplayData);
  };

  useEffect(() => {
    const updateLocalHooks = async () => {
      setIsLoading(true);
      await updateDisplayData(db, friendRequests);
      setIsLoading(false);
    };
    updateLocalHooks();
  }, [friendRequests]);

  useMemo(() => {
    const newRequestsSent: string[] = [];
    const newRequestsReceived: string[] = [];
    if (!isEmptyObject(friendRequests)) {
      Object.keys(friendRequests).forEach(requestId => {
        if (!friendRequests) {
          return;
        }
        if (friendRequests[requestId] === CONST.FRIEND_REQUEST_STATUS.SENT) {
          newRequestsSent.push(requestId);
        } else if (
          friendRequests[requestId] === CONST.FRIEND_REQUEST_STATUS.RECEIVED
        ) {
          newRequestsReceived.push(requestId);
        }
      });
    }
    const newRequestsSentCount = newRequestsSent.length;
    const newRequestsReceivedCount = newRequestsReceived.length;

    setRequestsSent(newRequestsSent);
    setRequestsReceived(newRequestsReceived);
    setRequestsSentCount(newRequestsSentCount);
    setRequestsReceivedCount(newRequestsReceivedCount);
  }, [friendRequests]);

  return (
    <View style={localStyles.mainContainer}>
      <ScrollView>
        {isLoading || !!loadingText ? (
          <FlexibleLoadingIndicator style={localStyles.loadingData} />
        ) : !isEmptyObject(friendRequests) ? (
          <View style={localStyles.friendList}>
            <GrayHeader
              headerText={`Requests Received (${requestsReceivedCount})`}
            />
            <View style={localStyles.requestsContainer}>
              {requestsReceived.map(requestId => (
                <FriendRequestItem
                  key={`${requestId}-friend-request-item`}
                  requestId={requestId}
                  friendRequests={friendRequests}
                  displayData={displayData}
                />
              ))}
            </View>
            <View style={headerStyles.grayHeaderContainer}>
              <Text style={headerStyles.grayHeaderText}>
                Requests Sent ({requestsSentCount})
              </Text>
            </View>
            <View style={localStyles.requestsContainer}>
              {requestsSent.map(requestId => (
                <FriendRequestItem
                  key={`${requestId}-friend-request-item`}
                  requestId={requestId}
                  friendRequests={friendRequests}
                  displayData={displayData}
                />
              ))}
            </View>
          </View>
        ) : (
          <NoFriendInfo
            message="Looking for new friends?"
            buttonText="Try searching here"
          />
        )}
      </ScrollView>
      <TouchableOpacity
        accessibilityRole="button"
        style={[
          localStyles.searchScreenButton,
          {
            backgroundColor: theme.appColor,
          },
        ]}
        onPress={() => Navigation.navigate(ROUTES.SOCIAL_FRIEND_SEARCH)}>
        <Icon
          src={KirokuIcons.Search}
          width={28}
          height={28}
          fill={theme.textLight}
        />
      </TouchableOpacity>
    </View>
  );
}

export default FriendRequestScreen;

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  loadingData: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    margin: 5,
  },
  friendList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'gray',
  },
  requestsInfoText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  requestsContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendRequestButtonsContainer: {
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 5,
  },
  handleRequestButton: {
    width: '50%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    margin: 2,
  },
  acceptRequestButton: {
    backgroundColor: 'green',
  },
  rejectRequestButton: {
    backgroundColor: 'red',
  },
  handleRequestButtonText: {
    width: '100%',
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
  },
  friendRequestPendingContainer: {
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 8,
  },
  searchScreenButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
  },
});
