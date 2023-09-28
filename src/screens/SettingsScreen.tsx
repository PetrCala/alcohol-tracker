import React, {useContext, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import { SettingsScreenProps } from '../types/screens';
import { getAuth } from 'firebase/auth';
import { useUserConnection } from '../context/UserConnectionContext';
import DatabaseContext from '../context/DatabaseContext';
import UserOffline from '../components/UserOffline';
import BasicButton from '../components/Buttons/BasicButton';

const SettingsItem: React.FC<{ item: any }> = ({ item }) => (
  <View style={styles.settingContainer}>
    <Text style={styles.settingLabel}>{item.label}</Text>
    <View style={styles.buttonsContainer}>
      {item.buttons.map((button:any, index:any) => (
        <TouchableOpacity 
          key={index} 
          style={[styles.button, { backgroundColor: button.color }]}
          onPress={button.action}
        >
          <Text style={styles.buttonText}>{button.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);


const SettingsScreen = ({ route, navigation }: SettingsScreenProps) => {
  if (!route || ! navigation) return null; // Should never be null
  const { preferences } = route.params;
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);
  const { isOnline } = useUserConnection();

  // Automatically navigate to login screen if login expires
  if (user == null){
      navigation.replace("Login Screen");
      return null;
  }

  const handleSaveSettings = () => {
    navigation.goBack();
  };

  const settingsData = [
    {
      label: 'Unit Colors',
      buttons: [
        { color: 'green', text: '9', action: () => console.log('Green 9 pressed') },
        { color: 'yellow', text: '10', action: () => console.log('Yellow 10 pressed') },
      ],
    },
    {
      label: 'Point Conversion',
      buttons: [
        { color: 'blue', text: '5', action: () => console.log('Blue 5 pressed') },
      ],
    },
    // Add more settings items as needed
  ];

  if (!isOnline) return (<UserOffline/>);

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-settings-screen'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
      <ScrollView style={styles.scrollView}>
        {settingsData.map((item, index) => (
          <SettingsItem key={index} item={item} />
        ))}
      </ScrollView>
      <View style={styles.saveSettingsButtonContainer}>
          <BasicButton 
              text='Save Settings'
              buttonStyle={styles.saveSettingsButton}
              textStyle={styles.saveSettingsButtonText}
              onPress={handleSaveSettings}
          />
      </View>
    </View>
  );
};

export default SettingsScreen;


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
  scrollView: {
      width: '100%',
      flexGrow:1, 
      flexShrink: 1,
      backgroundColor: '#FFFF99',
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 5,
    padding: 5,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveSettingsButtonContainer: {
    width: '100%',
    height: '10%',
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: '#FFFF99',
    marginBottom: 5,
    padding: 5,
  },
  saveSettingsButton: {
    width: '50%',
    height: '90%',
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fcf50f',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
  },
  saveSettingsButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});