import React, {useContext, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import {SettingsScreenProps} from '../types/screens';

import {useUserConnection} from '../context/global/UserConnectionContext';
import UserOffline from '../components/UserOffline';
import BasicButton from '../components/Buttons/BasicButton';
import {getDatabaseData} from '../context/global/DatabaseDataContext';
import commonStyles from '../styles/commonStyles';
import MainHeader from '@components/Header/MainHeader';
import {useFirebase} from '@context/global/FirebaseContext';

const SettingsItem: React.FC<{item: any}> = ({item}) => (
  <View style={styles.settingContainer}>
    <Text style={styles.settingLabel}>{item.label}</Text>
    <View style={styles.buttonsContainer}>
      {item.buttons.map((button: any, index: any) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, {backgroundColor: button.color}]}
          onPress={button.action}>
          <Text style={styles.buttonText}>{button.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const SettingsScreen = ({route, navigation}: SettingsScreenProps) => {
  if (!route || !navigation) return null; // Should never be null
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const {preferences} = getDatabaseData();
  const {isOnline} = useUserConnection();

  // Automatically navigate to login screen if login expires
  if (!user || !preferences) {
    navigation.replace('Login Screen');
    return null;
  }

  const handleSaveSettings = () => {
    navigation.goBack();
  };

  const settingsData = [
    {
      label: 'Unit Colors',
      buttons: [
        {
          color: 'green',
          text: '9',
          action: () => console.log('Green 9 pressed'),
        },
        {
          color: 'yellow',
          text: '10',
          action: () => console.log('Yellow 10 pressed'),
        },
      ],
    },
    {
      label: 'Point Conversion',
      buttons: [
        {color: 'blue', text: '5', action: () => console.log('Blue 5 pressed')},
      ],
    },
    // Add more settings items as needed
  ];

  if (!isOnline) return <UserOffline />;

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <MainHeader headerText="" onGoBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scrollView}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled">
        {settingsData.map((item, index) => (
          <SettingsItem key={index} item={item} />
        ))}
      </ScrollView>
      <View style={styles.saveSettingsButtonContainer}>
        <BasicButton
          text="Save Settings"
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
  scrollView: {
    width: '100%',
    flexGrow: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFF99',
    marginBottom: 5,
    padding: 5,
  },
  saveSettingsButton: {
    width: '50%',
    height: '90%',
    alignItems: 'center',
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
