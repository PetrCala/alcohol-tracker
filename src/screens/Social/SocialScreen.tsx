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

type SocialProps = {
  navigation: any;
};

type RouteType = {
  key: string;
  title: string;
  userData: UserData | null;
};

const SocialScreen = (props: SocialProps) => {
  const {navigation} = props;
  const {userData} = getDatabaseData();
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestDisplayData | undefined
  >(userData?.friend_requests);
  const [friends, setFriends] = useState<FriendsData | undefined>(
    userData?.friends,
  );
  const userHasFriends = userData?.friends ?? false;
  const [index, setIndex] = useState<number>(0); // Current screen index - defaults to friend requests in case of no friends
  const [routes] = useState([
    {key: 'friendList', title: 'Friend List', userData: userData},
    {key: 'friendSearch', title: 'Friend Search', userData: userData},
    {key: 'friendRequests', title: 'Friend Requests', userData: userData},
  ]);

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
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId="escape-statistics-screen"
          iconSource={require('../../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.menuContainer}>
          <Text style={styles.sectionText}>Friends</Text>
        </View>
      </View>
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
  backArrowContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 200,
  },
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
