import React, {
  useState,
  useContext,
  useEffect
} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';

import DatabaseContext from '../database/DatabaseContext';
import { readDataOnce } from '../database/baseFunctions';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

type ProfileProps = {
  navigation: any;
}

const ProfileScreen = (props: ProfileProps) => {
  const { navigation } = props;
  const [user, setUser] = useState<any | null>(null);
  const db = useContext(DatabaseContext);


  useEffect(() => {
    const auth = getAuth();
    const stopListening = onAuthStateChanged(auth, (user) => {
      if (user) { // User signed in
        setUser(user);
      } else {
        // User is signed out
      }
    });

    return () => stopListening();
  }, []); 


  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-profile-screen'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
      {/* <BasicButton
        text='TD'
        buttonStyle={styles.startSessionButton}
        textStyle={styles.startSessionText}
        onPress={() => {console.log('hello')}}
      /> */}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  backArrowContainer: {
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    position: 'absolute',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
});