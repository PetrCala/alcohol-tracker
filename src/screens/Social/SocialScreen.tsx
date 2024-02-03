import React, {useMemo, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../../components/Buttons/MenuIcon';
import {getDatabaseData} from '../../context/DatabaseDataContext';
import commonStyles from '../../styles/commonStyles';
import {
  FriendRequestData,
  FriendRequestDisplayData,
  FriendsData,
  UserData,
} from '../../types/database';
import {TabView, SceneMap} from 'react-native-tab-view';
import FriendListScreen from './FriendListScreen';
import FriendRequestScreen from './FriendRequestScreen';
import SearchScreen from './SearchScreen';
import {SocialScreenProps} from '@src/types/screens';
import Header from '@components/Header/Header';

type SocialFooterButtonProps = {
  index: number;
  currentIndex: number;
  setImageIndex: (index: number) => void;
  source: any;
  label: string;
};

const SocialFooterButton: React.FC<SocialFooterButtonProps> = ({
  index,
  currentIndex,
  setImageIndex,
  source,
  label,
}) => {
  return (
    <View style={styles.footerPartContainer}>
      <TouchableOpacity
        style={[
          styles.footerButton,
          currentIndex === index ? {backgroundColor: '#ebeb02'} : {},
        ]}
        onPress={() => setImageIndex(index)}>
        <Image source={source} style={styles.footerImage} />
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
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestDisplayData | undefined
  >(userData?.friend_requests);
  const [friends, setFriends] = useState<FriendsData | undefined>(
    userData?.friends,
  );
  const userHasFriends = userData?.friends ?? false;
  const [routes] = useState([
    {key: 'friendList', title: 'Friend List', userData: userData},
    {key: 'friendSearch', title: 'Friend Search', userData: userData},
    {key: 'friendRequests', title: 'Friend Requests', userData: userData},
  ]);
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
            friends={friends}
            setIndex={setIndex}
          />
        );
      case 'friendSearch':
        return (
          <SearchScreen
            friendRequests={friendRequests}
            setFriendRequests={setFriendRequests}
            friends={friends}
            setFriends={setFriends}
          />
        );
      case 'friendRequests':
        return (
          <FriendRequestScreen
            friendRequests={friendRequests}
            setFriendRequests={setFriendRequests}
            friends={friends}
            setFriends={setFriends}
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
    },
  ];

  useMemo(() => {
    if (!userData) return;
    setFriendRequests(userData.friend_requests);
    setFriends(userData.friends);
  }, [userData]);

  if (!userData) return null;

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <Header headerText="Friends" onGoBack={() => navigation.goBack()} />
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
