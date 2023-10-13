import React, {
  useState,
  useContext
} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import { getDatabaseData } from '../context/DatabaseDataContext';
import commonStyles from '../styles/commonStyles';
import { FriendIds } from '../types/database';

type FriendOverviewProps = {
  index: any;
  friendId: string;
}

type SocialProps = {
  navigation: any;
}


const FriendOverview = (props: FriendOverviewProps) => {
  const { index, friendId } = props;

  return (
    <View style={styles.friendOverviewContainer}>
      <Text key={index} style={styles.friendText}>{friendId}</Text>
      {/* <Image></Image> friend icon*/}
      {/* <Text></Text> friend nickname*/}
    </View>
  );
};


const SocialScreen = (props: SocialProps) => {
  const { navigation } = props;

  const { userData } = getDatabaseData();
  const friendsIds:FriendIds = userData?.friends ? Object.keys(userData.friends) : [];

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
      <View style={styles.mainContainer}>
        {friendsIds ? 
        <View style={styles.friendList}>
          {friendsIds.map((friendId, index) => (
            <FriendOverview
              index={index}
              friendId={friendId}
            />
          ))}
        </View>
        :
        <></>}
      </View>
    </View>
  );
};

export default SocialScreen;

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
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
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
  }
});