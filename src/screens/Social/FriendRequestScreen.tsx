// TODO translate
import {Alert, View} from 'react-native';
import type {
  FriendRequestList,
  FriendRequestStatus,
  ProfileList,
} from '@src/types/onyx';
import {useCallback, useEffect, useMemo, useState} from 'react';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useFirebase} from '@context/global/FirebaseContext';
import {acceptFriendRequest, deleteFriendRequest} from '@database/friends';
import type {Database} from 'firebase/database';
import NoFriendUserOverview from '@components/Social/NoFriendUserOverview';
import * as Profile from '@userActions/Profile';
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
import {PressableWithFeedback} from '@components/Pressable';
import Section from '@components/Section';
import {TranslationPaths} from '@src/languages/types';
import MenuItem from '@components/MenuItem';

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

type Menu = {
  sectionTitle: string;
  subtitle?: string;
  requestIds: string[];
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
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : '';
    Alert.alert(
      'User does not exist in the database',
      `Could not accept the friend request: ${errorMessage}`,
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
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : '';
    Alert.alert(
      'User does not exist in the database',
      `Could not accept the friend request: ${errorMessage}`,
    );
  }
};

// const getMenuItem = useCallback((menuItemsData: Menu) => {

//     const requestId = menuItemsData.requestId
//     const viewKey = `${requestId}-friend-request-buttons`

//     return (

//     <View key={viewKey} style={[styles.flexRow, styles.alignItemsCenter]}>
//       (requestStatus === CONST.FRIEND_REQUEST_STATUS.RECEIVED &&
//         <Button
//           success
//           key={`${requestId}-accept-request-button`}
//           text={translate('friendRequestScreen.accept')}
//           onPress={() =>
//             handleAcceptFriendRequest(db, user.uid, requestId, setIsLoading)
//           }
//           isLoading={isLoading}
//         />
//         <Button
//           danger
//           key={`${requestId}-reject-request-button`}
//           text={translate('friendRequestScreen.remove')}
//           onPress={() =>
//             handleRejectFriendRequest(db, user.uid, requestId, setIsLoading)
//           }
//           style={styles.ml1}
//           isLoading={isLoading}
//         />
//       )

// {/* // ) : requestStatus === CONST.FRIEND_REQUEST_STATUS.SENT ? ( */}
//       <Button
//         danger
//         onPress={() =>
//           handleRejectFriendRequest(db, user.uid, requestId, setIsLoading)
//         }
//         text={translate('common.cancel')}
//         isLoading={isLoading}
//       />
//     </View>
//     )

//     // {menuItemsData.items.map((detail, index) => (
//         //   <MenuItem
//         //     // eslint-disable-next-line react/no-array-index-key
//         //     key={`${detail.title}_${index}`}
//         //     title={detail.title}
//         //     titleStyle={styles.plainSectionTitle}
//         //     wrapperStyle={styles.sectionMenuItemTopDescription}
//         //     shouldUseRowFlexDirection
//         //     shouldShowRightIcon={false}
//         //     shouldShowRightComponent={!!detail.rightComponent}
//         //     rightComponent={detail.rightComponent}
//         //   />
//         // ))}

//         // key={`${requestId}-friend-request-item`}
//         // requestId={requestId}
//         // // friendRequests={friendRequests}
//   }

function FriendRequestScreen() {
  const {db} = useFirebase();
  const {userData} = useDatabaseData();
  const theme = useTheme();
  const styles = useThemeStyles();
  const {translate} = useLocalize();
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

  const requestsSentMenuItemsData: Menu = useMemo(() => {
    return {
      sectionTitle: translate(
        'friendRequestScreen.requestsSent',
        requestsSentCount,
      ),
      requestIds: requestsSent,
    };
  }, [requestsSentCount, requestsSent, translate]);

  const requestsReceivedMenuItemsData: Menu = useMemo(() => {
    return {
      sectionTitle: translate(
        'friendRequestScreen.requestsReceived',
        requestsReceivedCount,
      ),
      requestIds: requestsReceived,
    };
  }, [requestsReceivedCount, requestsReceived, translate]);

  const getMenuItemsSection = useCallback((menuItemsData: Menu) => {
    return (
      <Section
        title={menuItemsData.sectionTitle}
        titleStyles={styles.plainSectionTitle}
        containerStyles={[styles.bgTransparent, styles.mh0]}
        childrenStyles={styles.pt3}>
        <>
          {menuItemsData.requestIds.map((requestId, index) => {
            const profileData = displayData[requestId];
            const requestStatus = friendRequests
              ? friendRequests[requestId]
              : 'unknown';

            return (
              <MenuItem
                // eslint-disable-next-line react/no-array-index-key
                key={`friend-request-overview_${index}`}
                // wrapperStyle={styles.sectionMenuItem}
                // title={keyTitle}
                // icon={item.icon}
                icon={KirokuIcons.Logo}
                iconType={CONST.ICON_TYPE_AVATAR}
                disabled
                shouldGreyOutWhenDisabled={false}
                // onPress={singleExecution(() => {
                //   if (item.action) {
                //     item.action();
                //   } else {
                //     waitForNavigate(() => {
                //       Navigation.navigate(item.routeName);
                //     })();
                //   }
                // })}
                // iconStyles={item.iconStyles}
                // fallbackIcon={item.fallbackIcon}
                // shouldStackHorizontally={item.shouldStackHorizontally}
                // ref={popoverAnchor}
                // hoverAndPressStyle={styles.hoveredComponentBG}
                // shouldBlockSelection={!!item.link}
                // focused={
                //   !!activeCentralPaneRoute &&
                //   !!item.routeName &&
                //   !!(
                //     activeCentralPaneRoute.name
                //       .toLowerCase()
                //       .replaceAll('_', '') ===
                //     item.routeName.toLowerCase().replaceAll('/', '')
                //   )
                // }
                isPaneMenu
                // iconRight={item.iconRight}
                // shouldShowRightIcon={item.shouldShowRightIcon}
              />
            );
          })}
        </>
      </Section>
    );
  }, []);

  const requestsReceivedMenuItems = useMemo(
    () => getMenuItemsSection(requestsReceivedMenuItemsData),
    [requestsReceivedMenuItemsData, getMenuItemsSection],
  );
  const requestsSentMenuItems = useMemo(
    () => getMenuItemsSection(requestsSentMenuItemsData),
    [requestsSentMenuItemsData, getMenuItemsSection],
  );

  return (
    <View style={styles.flex1}>
      <ScrollView style={[styles.mw100]}>
        {isLoading || !!loadingText ? (
          <FlexibleLoadingIndicator style={styles.mt5} />
        ) : (
          <View>
            {!isEmptyObject(friendRequests) ? (
              <>
                {requestsReceivedMenuItems}
                {requestsSentMenuItems}
              </>
            ) : (
              <NoFriendInfo
                message={translate('friendRequestScreen.lookingForNewFriends')}
                buttonText={translate('friendRequestScreen.trySearchingHere')}
              />
            )}
          </View>
        )}
      </ScrollView>
      <PressableWithFeedback
        accessibilityLabel={'search-screen-button'}
        style={styles.goToSearchScreenButton}
        onPress={() => Navigation.navigate(ROUTES.SOCIAL_FRIEND_SEARCH)}>
        <Icon
          src={KirokuIcons.Search}
          width={28}
          height={28}
          fill={theme.textLight}
        />
      </PressableWithFeedback>
    </View>
  );
}

export default FriendRequestScreen;
