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
    FlatList
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import styles from '../styles';
import DatabaseContext from '../DatabaseContext';
import { listenForDataChanges, readDataOnce, removeDrinkingSessionData, saveDrinkingSessionData } from "../database";
import { timestampToDate, fetchDrinkingSessions } from '../utils/dataHandling';
import { MainScreenProps, UserData, DrinkingSessionIds, DrinkingSessionData } from '../utils/types';

const MainScreen = ( { navigation }: MainScreenProps) => {
  const db = useContext(DatabaseContext);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [drinkingSessionIds, setDrinkingsessionIds] = useState<DrinkingSessionIds | null>(null); // Ids
  const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | null>([]); // Data

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

  /**
   * Get a list of all drinking sessions and use this to update the state
   * of drinking sessions.
   */
  const loadAllDrinkingSessions = async(db: any, sessionIds: any) => {
    try {
      const drinkingSessions = await fetchDrinkingSessions(db, sessionIds);
      setDrinkingsessionData(drinkingSessions);
    } catch (error:any){
      throw new Error("Failed to retrieve the drinking session data.");
    };
  };


  // Monitor and update user data
  useEffect(() =>{
    getUserData(db, userId);
  }, []);

  // Monitor and update drinking session id data
  useEffect(() => {
    // Start listening for changes when the component mounts
    const refString = `user_drinking_sessions/${userId}`
    const stopListening = listenForDataChanges(db, refString, (ids:any) => {
      setDrinkingsessionIds(ids);
    });

    // Stop listening for changes when the component unmounts
    return () => {
      stopListening();
    };
  }, [db, userId]); // Re-run effect when userId or db changes


  // Monitor and update drinking session data
  useEffect(() => {
    if (drinkingSessionIds != null){
      loadAllDrinkingSessions(db, drinkingSessionIds);
    } else {
      setDrinkingsessionData([]); // No data remaining
    }
  }, [drinkingSessionIds]); 



  const testRemoveFirstSession = async () => {
    try {
      if (drinkingSessionIds != null){
        const sessionKeys = Object.keys(drinkingSessionIds);
        const lastSessionId = sessionKeys[0];
        await removeDrinkingSessionData(db, userId, lastSessionId);
      }
    } catch (error:any){
      throw new Error("Failed to retrieve the user data.");
    }
  }

  // Loading user data
  if (userData == null) {
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
                  onPress = {() => navigation.navigate('Day Overview Screen', {
                    timestamp: Date.now()
                  })}
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
            <Text>Drinking sessions here</Text>
            :
            <Text style={styles.menuDrinkingSessionInfoText}>No drinking sessions found</Text>
            }
            {/*<Text>Calendar</Text>*/}
            <TouchableOpacity style={styles.redButton} onPress={testRemoveFirstSession}>
              <Text style={styles.redButtonText}>X</Text>
            </TouchableOpacity>
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