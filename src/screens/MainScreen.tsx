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
import LoadingData from '../components/loadingData';
import styles from '../styles';
import DatabaseContext from '../DatabaseContext';
import { listenForDataChanges, updateDrinkingSessionUserData } from "../database";
import { MainScreenProps, UserDataProps, DrinkingSessionData } from '../utils/types';
import { update } from 'firebase/database';

const MainScreen = ( { navigation }: MainScreenProps) => {
  const db = useContext(DatabaseContext);
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | null>([]); // Data
  const [ loadingUserData, setUserLoadingData] = useState<boolean | null>(true);
  const [ loadingSessionData, setLoadingSessionData] = useState<boolean | null>(true);

  const userId = 'petr_cala';

  // Handle drinking session button press
  const startDrinkingSession = async () => {
    if (userData == null){
      throw new Error("This function should never be called outside rendered main screen.")
    }
    let startingUnits = userData.current_units;
    let sessionStartTime = userData.current_timestamp;
    if (!userData.in_session){
      try {
        let newSessionStartTime = Date.now();
        let updates: {[key: string]: any} = {};
        // Inform database of new session started
        updates[`users/${userId}/in_session`] = true;
        // Set the start time to now if session is new
        updates[`users/${userId}/current_timestamp`] = newSessionStartTime;
        // Reset starting units
        updates[`users/${userId}/current_units`] = 0;
        await updateDrinkingSessionUserData(db, updates);
      } catch (error: any) {
          console.error('Failed to start a new session: ' + error.message);
      }
    }
    navigation.navigate("Drinking Session Screen", {
      timestamp: sessionStartTime,
      current_units: startingUnits
    });
  }

  // Monitor user data
  useEffect(() => {
      let userRef = `users/${userId}`
      let stopListening = listenForDataChanges(db, userRef, false, (data:UserDataProps) => {
        setUserData(data);
        setUserLoadingData(false);
      });

      return () => {
        stopListening();
      };

    }, [db, userId]);

  // Monitor drinking session data
  useEffect(() => {
    // Start listening for changes when the component mounts
    let sessionsRef = `user_drinking_sessions/${userId}`
    let stopListening = listenForDataChanges(db, sessionsRef, true, (data:any) => {
      setDrinkingsessionData(data);
      setLoadingSessionData(false);
    });

    // Stop listening for changes when the component unmounts
    return () => {
      stopListening();
    };
  }, [db, userId]); // Re-run effect when userId or db changes


  if (loadingUserData || loadingSessionData) {
    return(
      <LoadingData
        loadingText="Loading data..."
      />
    )
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
              <Text style={styles.headerUsername}>{userData?.username}</Text> 
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
            {userData?.in_session ?
            <View style={styles.menuInSessionWarningContainer}>
              <Text style={styles.menuInSessionWarningText}>You are currently in session!</Text> 
            </View>
            :
            <></>
            } 
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
              onPress = {startDrinkingSession} />
        </View>
    </View>
  );
};

export default MainScreen;