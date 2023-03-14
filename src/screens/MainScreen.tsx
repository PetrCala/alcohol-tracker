import React from 'react';
import { 
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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
                <TouchableOpacity onPress={handleProfileClick}>
                <Image source={require('../assets/temp/temp_user_icon.jpg')} style={styles.profileIcon} />
                </TouchableOpacity>
            </View>
            <View style={styles.headerUsernameContainer}>
              <Text style={styles.headerUsername}>Petr</Text>
            </View>
            <View style={styles.menuContainer}>
                {/* Replace these with clickable icons for social, achievements, and settings */}
                <TouchableOpacity onPress={handleSocialClick} style={styles.menuIconContainer}>
                <Image source={require('../assets/icons/social.png')} style={styles.menuIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAchievementsClick} style={styles.menuIconContainer}>
                <Image source={require('../assets/icons/achievements.png')} style={styles.menuIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSettingsClick} style={styles.menuIconContainer}>
                <Image source={require('../assets/icons/settings.png')} style={styles.menuIcon} />
                </TouchableOpacity>
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
                <TouchableOpacity onPress={handleStartSession} style={styles.startSessionButton}>
                    <Text style={styles.startSessionText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
  );
};

export default MainScreen;