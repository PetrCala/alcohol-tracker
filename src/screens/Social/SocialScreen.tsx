import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {getDatabaseData} from '@src/context/global/DatabaseDataContext';
import commonStyles from '@src/styles/commonStyles';
import {UserData} from '@src/types/database';
import {TabView} from 'react-native-tab-view';
import FriendListScreen from './FriendListScreen';
import FriendRequestScreen from './FriendRequestScreen';
import SearchScreen from './SearchScreen';
import {
  FriendListScreenProps,
  SearchScreenProps,
  SocialScreenProps,
} from '@src/types/screens';
import MainHeader from '@components/Header/MainHeader';
import {getReceivedRequestsCount} from '@src/utils/social/friendUtils';
import {useIsFocused} from '@react-navigation/native';

type SocialFooterButtonProps = {
  index: number;
  currentIndex: number;
  setImageIndex: (index: number) => void;
  source: any;
  label: string;
  infoNumberValue?: number;
};

const SocialFooterButton: React.FC<SocialFooterButtonProps> = ({
  index,
  currentIndex,
  setImageIndex,
  source,
  label,
  infoNumberValue,
}) => {
  const displayNumberValue = infoNumberValue && infoNumberValue > 0;
  return (
    <View style={styles.footerPartContainer}>
      <TouchableOpacity
        style={[
          styles.footerButton,
          currentIndex === index ? {backgroundColor: '#ebeb02'} : {},
        ]}
        onPress={() => setImageIndex(index)}>
        <View
          style={
            displayNumberValue
              ? [styles.imageContainer, styles.extraSpacing]
              : styles.imageContainer
          }>
          <Image source={source} style={styles.footerImage} />
          {displayNumberValue ? (
            <View style={styles.friendRequestCounter}>
              <Text style={styles.friendRequestCounterValue}>
                {infoNumberValue}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.footerText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

type RouteType = {
  key: string;
  title: string;
  userData: UserData | null;
};

const SocialScreen = ({route, navigation}: SocialScreenProps) => {
  if (!route || !navigation) return null;
  const {screen} = route.params;
  const {userData} = getDatabaseData();
  const [routes] = useState([
    {key: 'friendList', title: 'Friend List', userData: userData},
    {key: 'friendSearch', title: 'Friend Search', userData: userData},
    {key: 'friendRequests', title: 'Friend Requests', userData: userData},
  ]);
  const friendListRef = useRef<FriendListScreenProps>(null);
  const searchScreenRef = useRef<SearchScreenProps>(null);
  const [index, setIndex] = useState<number>(
    routes.findIndex(route => route.title === screen) || 0, // Get the index of the screen based on the title
  );

  const renderScene = ({route}: {route: RouteType}) => {
    if (!userData) return null;
    switch (route.key) {
      case 'friendList':
        return (
          <FriendListScreen
            navigation={navigation}
            friends={userData?.friends}
            setIndex={setIndex}
          />
        );
      case 'friendSearch':
        return (
          <SearchScreen
            friendRequests={userData?.friend_requests}
            friends={userData?.friends}
          />
        );
      case 'friendRequests':
        return (
          <FriendRequestScreen
            friendRequests={userData?.friend_requests}
            friends={userData?.friends}
          />
        );
      default:
        return null;
    }
  };

  const footerButtons = [
    {
      index: 0,
      source: require('../../../assets/icons/friend_list.png'),
      label: 'Friend List',
    },
    {
      index: 1,
      source: require('../../../assets/icons/search.png'),
      label: 'Search',
    },
    {
      index: 2,
      source: require('../../../assets/icons/add_user.png'),
      label: 'Friend Requests',
      infoNumberValue: getReceivedRequestsCount(userData?.friend_requests),
    },
  ];

  if (!userData) return null;

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <MainHeader headerText="Friends" onGoBack={() => navigation.goBack()} />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: Dimensions.get('window').width}}
        swipeEnabled={true}
        tabBarPosition="bottom"
        renderTabBar={() => null} // Do not render the default tab bar
      />
      <View style={commonStyles.mainFooter}>
        {footerButtons.map(button => (
          <SocialFooterButton
            key={button.index}
            index={button.index}
            currentIndex={index}
            setImageIndex={setIndex}
            source={button.source}
            label={button.label}
            infoNumberValue={button.infoNumberValue}
          />
        ))}
      </View>
    </View>
  );
};

export default SocialScreen;

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  sectionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  scrollViewContainer: {
    flex: 1,
    // justifyContent: 'center',
  },
  friendList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 3,
  },
  friendOverviewContainer: {
    width: '80%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 2,
    padding: 2,
  },
  friendText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '400',
  },
  footerPartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButton: {
    width: screenWidth / 3,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerImageWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: '#ebeb02',
  },
  imageContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraSpacing: {
    marginLeft: 30, // 20 + 10
  },
  friendRequestCounter: {
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    marginLeft: 10,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  friendRequestCounterValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  footerImage: {
    width: 25,
    height: 25,
    padding: 5,
    // tintColor: '#ebeb02',
    // tintColor: '#000',
    tintColor: 'gray',
  },
  footerText: {
    fontSize: 12,
    color: 'gray',
  },
});
