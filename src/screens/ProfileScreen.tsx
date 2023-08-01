import React, {
  useState,
  useContext,
  useEffect
} from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';

import { readUserDataOnce } from '../database';
import DatabaseContext from '../DatabaseContext';

type ProfileProps = {
  navigation: any;
}


type UserData = {
  username: string;
};

const ProfileScreen = (props: ProfileProps) => {
  const { navigation } = props;

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.header}>
        <MenuIcon
          iconId='escape-profile-screen'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
      <BasicButton
        text='TD'
        buttonStyle={styles.startSessionButton}
        textStyle={styles.startSessionText}
        onPress={() => console.log("no functionality")}
      />
    </View>
  );
};

export default ProfileScreen;