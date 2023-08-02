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

import DatabaseContext from '../DatabaseContext';
import { readUserDataOnce } from '../database';
import { ref, get, onValue } from "firebase/database";
import { saveDrinkingSessionData, removeDrinkingSessionData } from '../database';

type ProfileProps = {
  navigation: any;
}

const ProfileScreen = (props: ProfileProps) => {
  const { navigation } = props;
  const db = useContext(DatabaseContext);
  const userId = 'petr_cala';
  const sessionId = '-NaqnsVVobr1NXPEhFqP2';


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
        onPress={() => {console.log("does nothing")}}
      />
    </View>
  );
};

export default ProfileScreen;