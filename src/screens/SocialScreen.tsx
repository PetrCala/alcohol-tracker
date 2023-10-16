import React, {
  useState,
  useContext
} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import { getDatabaseData } from '../context/DatabaseDataContext';
import commonStyles from '../styles/commonStyles';
import { FriendIds, FriendRequestStatus, UserData } from '../types/database';
import { TabView, SceneMap } from 'react-native-tab-view';
import FriendListScreen from './Social/FriendListScreen';
import FriendRequestScreen from './Social/FriendRequestScreen';

type SocialProps = {
  navigation: any;
}

type RouteType = {
  key: string;
  title: string;
  userData: UserData | null;
};

const SocialScreen = (props: SocialProps) => {
  const { navigation } = props;
  const { userData } = getDatabaseData();
  const userHasFriends = userData?.friends !== undefined;
  const [index, setIndex] = useState<number>(userHasFriends === true ? 0 : 1); // Current screen index - defaults to friend requests in case of no friends
  const [routes] = useState([
    { key: 'friendList', title: 'Friend List', userData: userData},
    { key: 'friendRequests', title: 'Friend Requests', userData: userData},
  ]);


  const renderScene = ({ route }: {route: RouteType }) => {
    if (!userData) return null;
    switch (route.key) {
      case 'friendList':
        return <FriendListScreen userData={route.userData} />;
      case 'friendRequests':
        return <FriendRequestScreen userData={route.userData}/>;
      default:
        return null;
    };
  }

  if (!userData) return null;

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId='escape-statistics-screen'
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
        <View style={styles.menuContainer}>
          <Text style={styles.sectionText}>Friends</Text>
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        swipeEnabled={true}
        tabBarPosition="bottom"
        renderTabBar={() => null} // Do not render the default tab bar
      />
      <View style={commonStyles.mainFooter}>
        <View style={styles.footerHalfContainer}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              index === 0 ? { backgroundColor: '#ebeb02' } : {},
            ]}
            onPress={() => setIndex(0)}
          >
            <Image
              source={require('../../assets/icons/friend_list.png')}
              style={styles.footerImage}
            />
            <Text style={styles.footerText}>Friend List</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerHalfContainer}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              index === 1 ? { backgroundColor: '#ebeb02' } : {},
            ]}
            onPress={() => setIndex(1)}
          >
            <Image
              source={require('../../assets/icons/add_user.png')}
              style={styles.footerImage}
            />
            <Text style={styles.footerText}>Add Friends</Text>
          </TouchableOpacity>
        </View>
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
  footerHalfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButton: {
    width: screenWidth * 0.5,
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
  }
});