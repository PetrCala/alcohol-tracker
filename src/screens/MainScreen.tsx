import React from 'react';
import { 
    ScrollView,
    Text,
    View,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import styles from '../styles';
import { ref, onValue } from "firebase/database";

type MainScreenProps = {
  navigation: any;
}

const MainScreen = (props: MainScreenProps) => {
  const { navigation } = props;

  const handleProfileClick = () => {
    // Code to navigate to the profile screen
  };

  const handleSocialClick = () => {
    // Code to navigate to the social screen
  };

  const handleAchievementsClick = () => {
    // Code to navigate to the achievements screen
  };

  const handleSettingsClick = () => {
    // Code to navigate to the settings screen
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.profileIconContainer}>
                {/* User's clickable icon */}
                <MenuIcon 
                  iconId='profile-icon'
                  iconSource={require('../assets/temp/temp_user_icon.jpg')} 
                  containerStyle={styles.profileIconContainer}
                  iconStyle={styles.profileIcon}
                  onPress={handleProfileClick}
                  />
            </View>
            <View style={styles.headerUsernameContainer}>
              <Text style={styles.headerUsername}>Petr</Text>
            </View>
            <View style={styles.menuContainer}>
                {/* Clickable icons for social, achievements, and settings */}
                <MenuIcon 
                  iconId='social-icon'
                  iconSource={require('../assets/icons/social.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress={handleSocialClick}
                  />
                <MenuIcon 
                  iconId='achievements-icon'
                  iconSource={require('../assets/icons/achievements.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress={handleAchievementsClick}
                  />
                <MenuIcon 
                  iconId='settings-icon'
                  iconSource={require('../assets/icons/settings.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress={handleSettingsClick}
                  />
            </View>
        </View>
        <View style={styles.mainScreenContent}>
            <ScrollView>
                {/* Replace this with the overview and statistics */}
                <Text>Overview and Statistics</Text>
                {/* Replace this with the large scrollable calendar */}
                <Text>Calendar</Text>
            </ScrollView>
            <BasicButton 
              text='+'
              buttonStyle={styles.startSessionButton}
              textStyle={styles.startSessionText}
              onPress = {() => navigation.navigate('Drinking Session')} />
        </View>
    </View>
  );
};

export default MainScreen;