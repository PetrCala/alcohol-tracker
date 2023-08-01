import 
  React,
{
  useState,
  useContext,
  useEffect,
} from 'react';
import { 
    ScrollView,
    Text,
    View,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import styles from '../styles';
import DatabaseContext from '../DatabaseContext';
import { readUserDataOnce, listenForDataChanges } from "../database";

type MainScreenProps = {
  navigation: any;
}

type UserData = {
  username: string;
};

const MainScreen = (props: MainScreenProps) => {
  const { navigation } = props;
  const db = useContext(DatabaseContext);
  const [userData, setUserData] = useState<UserData | null>(null);
  const userId = 'petr_cala';

  useEffect(() => {
    // Start listening for changes when the component mounts
    const stopListening = listenForDataChanges(db, userId, (data) => {
      setUserData(data);
    });

    // Stop listening for changes when the component unmounts
    return () => {
      stopListening();
    };
  }, [db, userId]); // Re-run effect when userId or db changes


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
                  onPress = {() => navigation.navigate('Profile Screen')}
                  />
            </View>
            <View style={styles.headerUsernameContainer}>
              {userData ? 
              <Text style={styles.headerUsername}>{userData.username}</Text> 
                : 
              <Text style={styles.headerUsername}>Loading...</Text>
              }
            </View>
            <View style={styles.menuContainer}>
                {/* Clickable icons for social, achievements, and settings */}
                <MenuIcon 
                  iconId='social-icon'
                  iconSource={require('../assets/icons/social.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress = {() => navigation.navigate('Social Screen')}
                  />
                <MenuIcon 
                  iconId='achievement-icon'
                  iconSource={require('../assets/icons/achievements.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress = {() => navigation.navigate('Achievement Screen')}
                  />
                <MenuIcon 
                  iconId='settings-icon'
                  iconSource={require('../assets/icons/settings.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress = {() => navigation.navigate('Settings Screen')}
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
              onPress = {() => navigation.navigate('Drinking Session Screen')} />
        </View>
    </View>
  );
};

export default MainScreen;