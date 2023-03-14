import React from 'react';
import { 
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import StartSessionButton from '../components/Buttons/SessionButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import DrinkingSession from './DrinkingSessionScreen';
import styles from '../styles';


const MainScreen = () => {
  const handleStartSession = () => {
    return <DrinkingSession />;
  };

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
                <TouchableOpacity accessibilityRole='button' onPress={handleProfileClick}>
                <Image source={require('../assets/temp/temp_user_icon.jpg')} style={styles.profileIcon} />
                </TouchableOpacity>
            </View>
            <View style={styles.headerUsernameContainer}>
              <Text style={styles.headerUsername}>Petr</Text>
            </View>
            <View style={styles.menuContainer}>
                {/* Clickable icons for social, achievements, and settings */}
                <MenuIcon 
                  iconId='social-icon'
                  iconSource={require('../assets/icons/social.png')} 
                  onPress={handleSocialClick}
                  />
                <MenuIcon 
                  iconId='achievements-icon'
                  iconSource={require('../assets/icons/achievements.png')} 
                  onPress={handleAchievementsClick}
                  />
                <MenuIcon 
                  iconId='settings-icon'
                  iconSource={require('../assets/icons/settings.png')} 
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
            <View style={styles.startSessionButtonContainer}>
              <StartSessionButton onPress = {handleStartSession} />
            </View>
        </View>
    </View>
  );
};

export default MainScreen;