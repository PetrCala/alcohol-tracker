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

import DatabaseContext from '../database/DatabaseContext';
import { readDataOnce } from '../database/baseFunctions';
import { listenForUserId } from '../auth/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

type ProfileProps = {
  navigation: any;
}

const ProfileScreen = (props: ProfileProps) => {
  const { navigation } = props;
  const [userId, setUserId] = useState<string | null>(null);
  const db = useContext(DatabaseContext);
  const sessionId = '-NaqnsVVobr1NXPEhFqP2';


  useEffect(() => {
    const auth = getAuth();
    const stopListening = onAuthStateChanged(auth, (user) => {
      if (user) { // User signed in
        setUserId(user.uid);
      } else {
        // User is signed out
      }
    });

    return () => stopListening();
  }, []); 


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
        onPress={() => {console.log('hello')}}
      />
    </View>
  );
};

export default ProfileScreen;