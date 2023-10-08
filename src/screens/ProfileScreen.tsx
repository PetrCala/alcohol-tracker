import React, {
  useState,
  useContext,
  useEffect
} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';

import DatabaseContext from '../context/DatabaseContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

type ProfileProps = {
  navigation: any;
}

const ProfileScreen = (props: ProfileProps) => {
  const { navigation } = props;
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);

  // const handleButtonPress = () => {
  //   console.log('hi')
  // };



  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-profile-screen'
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
        {/* <TouchableOpacity
          style={styles.startSessionButton}
          onPress={() => {handleButtonPress}} >
          <Text style={styles.startSessionText}> ! </Text>
        </TouchableOpacity> */}
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
    shadowColor: '#000',             
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25,             
    shadowRadius: 3.84,              
    elevation: 5,
    zIndex: 1,
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
  startSessionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
  },
  startSessionText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});