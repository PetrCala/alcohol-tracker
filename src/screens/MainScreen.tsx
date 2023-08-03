import 
  React,
{
  useState,
  useContext,
  useEffect,
} from 'react';
import { 
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import SessionsCalendar from 'react-native-calendars/src/calendar';
import styles from '../styles';
import DatabaseContext from '../DatabaseContext';
import { listenForDataChanges, readDataOnce, removeDrinkingSessionData, saveDrinkingSessionData } from "../database";
import { MainScreenProps, UserData, DrinkingSessionIds, DrinkingSessionData } from '../utils/types';

const MainScreen = ( { navigation }: MainScreenProps) => {
  const db = useContext(DatabaseContext);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | null>([]); // Data
  const [ loadingData, setLoadingData] = useState<boolean | null>(true);

  const userId = 'petr_cala';

  const getUserData = async (db:any, userId: string) => {
    try {
      let refString = `users/${userId}`
      const userData = await readDataOnce(db, refString);
      setUserData(userData);
    } catch (error:any){
      throw new Error("Failed to retrieve the user data.");
    }
  }

  // Monitor and update user data
  useEffect(() =>{
    getUserData(db, userId);
  }, []);

  // Monitor drinking session data
  useEffect(() => {
    // Start listening for changes when the component mounts
    const refString = `user_drinking_sessions/${userId}`
    const stopListening = listenForDataChanges(db, refString, (data:any) => {
      setDrinkingsessionData(data);
      setLoadingData(false);
    });

    // Stop listening for changes when the component unmounts
    return () => {
      stopListening();
    };
  }, [db, userId]); // Re-run effect when userId or db changes

  if (userData == null || loadingData) {
    return (
      <View style={styles.container}>
        <Text>Loading data...</Text>
        <ActivityIndicator 
          size="large"
          color = "#0000ff"
          />
      </View>
    );
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
                  onPress = {() => navigation.navigate('Profile Screen')}
                  />
            </View>
            <View style={styles.headerUsernameContainer}>
              <Text style={styles.headerUsername}>{userData.username}</Text> 
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
            <Text style={styles.menuDrinkingSessionInfoText}>Your drinking sessions:</Text> 
            {/* Replace this with the overview and statistics */}
            {drinkingSessionData ?
            <SessionsCalendar
              drinkingSessionData = {drinkingSessionData}
              onDayPress = {(day) => {
                navigation.navigate('Day Overview Screen',
                { timestamp: day.timestamp }
                )
              }}
            />
            :
            <Text style={styles.menuDrinkingSessionInfoText}>No drinking sessions found</Text>
            }
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