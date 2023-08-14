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
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import SessionsCalendar from '../components/Calendar';
import LoadingData from '../components/LoadingData';
import styles from '../styles';
import DatabaseContext from '../database/DatabaseContext';
import { listenForDataChanges } from "../database/baseFunctions";
import { updateDrinkingSessionUserData } from '../database/drinkingSessions';
import { MainScreenProps, UserDataProps, DrinkingSessionData } from '../utils/types';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';


const MainScreen = ( { navigation }: MainScreenProps) => {
  const db = useContext(DatabaseContext);
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | null>([]); // Data
  const [ loadingUserData, setUserLoadingData] = useState<boolean | null>(true);
  const [ loadingSessionData, setLoadingSessionData] = useState<boolean | null>(true);

  // Handle drinking session button press
  const startDrinkingSession = async () => {
    if (userData == null){
      throw new Error("The user" + user.displayName + " has no data in the database.")
    }
    let startingUnits = userData.current_units;
    let sessionStartTime = userData.current_timestamp;
    if (!userData.in_session){
      startingUnits = 0;
      sessionStartTime = Date.now();
      let updates: {[key: string]: any} = {};
      // Inform database of new session started
      updates[`users/${user.uid}/in_session`] = true;
      // Set the start time to now if session is new
      updates[`users/${user.uid}/current_timestamp`] = sessionStartTime;
      // Reset starting units
      updates[`users/${user.uid}/current_units`] = startingUnits;
      try {
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

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigation.replace("Login Screen");
    } catch (error:any) {
      throw new Error("There was an error signing out: " + error.message);
    }
  };

  // Monitor authentificated user
  useEffect(() => {
    const auth = getAuth();
    const stopListening = onAuthStateChanged(auth, (user) => {
      if (user) { // User signed in
        setUser(user);
      } else {
        // User is signed out
      }
    });

    return () => stopListening();
  }, []); 

  // Monitor user data
  useEffect(() => {
    if (user != null){
      let userRef = `users/${user.uid}`
      let stopListening = listenForDataChanges(db, userRef, (data:UserDataProps) => {
        setUserData(data);
        setUserLoadingData(false);
      });

      return () => stopListening();
    };

    }, [db, user]);

  // Monitor drinking session data
  useEffect(() => {
    if (user != null) {
      // Start listening for changes when the component mounts
      let sessionsRef = `user_drinking_sessions/${user.uid}`
      let stopListening = listenForDataChanges(db, sessionsRef, (data:any) => {
        let newDrinkingSessionData:DrinkingSessionData[] = [];
        if (data != null){
          newDrinkingSessionData = Object.values(data); // To an array
        }
        setDrinkingsessionData(newDrinkingSessionData);
        setLoadingSessionData(false);
      });
  
      // Stop listening for changes when the component unmounts
      return () => {
        stopListening();
      };
    };

  }, [db, user]); // Re-run effect when userId or db changes


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
              <Text style={styles.headerUsername}>{user.displayName}</Text> 
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
                  // onPress = {() => navigation.navigate('Settings Screen')}
                  onPress = {handleSignOut}
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