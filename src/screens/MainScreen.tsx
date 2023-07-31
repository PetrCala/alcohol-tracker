import 
  React,
{
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
import { readDataOnce, listenForDataChanges } from "../database";

type MainScreenProps = {
  navigation: any;
}

const MainScreen = (props: MainScreenProps) => {
  const { navigation } = props;
  const db = useContext(DatabaseContext);

  // useEffect(() => {
  //   if (db) {
  //     // Replace 'user1' with the actual user ID
  //     readDataOnce(db, 'user1');
  
  //     // Subscribe to data changes and update the component state or perform other actions
  //     const unsubscribe = listenForDataChanges(db, 'user1', (data) => {
  //       console.log('Data changed:', data);
  //     });
  
  //     // Clean up the listener on unmount
  //     return () => {
  //       unsubscribe();
  //     };
  //   }
  // }, [db]);

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
              <Text style={styles.headerUsername}>Petr</Text>
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