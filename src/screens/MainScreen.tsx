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
import { listenForDrinkingSessionChanges, readUserDataOnce, removeDrinkingSessionData } from "../database";
import { get, ref, query, onValue, equalTo } from "firebase/database";
import { render } from '@testing-library/react-native';

type MainScreenProps = {
  navigation: any;
}

type UserData = {
  username: string;
};

type DrinkingSessionIds = {
  key: string;
}

type DrinkingSessionData = {
  session_id: any;
  timestamp: number;
  units: number;
  user_id: string;
}

type DrinkingSessionProps = {
  session: DrinkingSessionData
}

const MainScreen = (props: MainScreenProps) => {
  const { navigation } = props;
  const db = useContext(DatabaseContext);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [drinkingSessionIds, setDrinkingsessionIds] = useState<DrinkingSessionIds | null>(null); // Ids
  const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | null>([]); // Data

  const userId = 'petr_cala';

  const getUserData = async () => {
    try {
      const userData = await readUserDataOnce(db, userId);
      setUserData(userData);
    } catch (error:any){
      throw new Error("Failed to retrieve the user data.");
    }
  }

  const fetchDrinkingSessions = async (db: any, sessionIds: any) => {
    try {
      let drinkingSessions: DrinkingSessionData[] = [];
      const sessionKeys = Object.keys(sessionIds); // SessionIds: {key: true}
      for (let sessionKey of sessionKeys){
        let sessionRef = ref(db, `drinking_sessions/${sessionKey}`);
        const sessionSnapshot = await get(sessionRef);
        // Handle missing session
        const sessionDetails = sessionSnapshot.val();
        drinkingSessions.push(sessionDetails);
      }
      setDrinkingsessionData(drinkingSessions);
      } catch (error:any){
        throw new Error("Failed to retrieve the drinking session data.");
      }
    return null;
  };

  // Monitor and update user data
  useEffect(() => {
    getUserData();
  }, []); // Assume relatively constant


  // Monitor and update drinking session id data
  useEffect(() => {
    // Start listening for changes when the component mounts
    const stopListening = listenForDrinkingSessionChanges(db, userId, (ids:any) => {
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
      fetchDrinkingSessions(db, drinkingSessionIds);
    } else {
      setDrinkingsessionData([]); // No data remaining
    }
  }, [drinkingSessionIds]); 


  const DrinkingSession = ({session}: DrinkingSessionProps) => {
    // Convert the timestamp to a Date object
    const dateObject = new Date(session.timestamp);

    // Extract the date, month, and year, and format them as MM-DD-YYYY
    const date = ('0' + (dateObject.getMonth() + 1)).slice(-2) + '-' + 
                ('0' + dateObject.getDate()).slice(-2) + '-' + 
                dateObject.getFullYear();


      return (
        <View style={styles.menuDrinkingSessionContainer}>
          <Text style={styles.menuDrinkingSessionText}>Date: {date}</Text>
          <Text style={styles.menuDrinkingSessionText}>Units consumed: {session.units}</Text>
        </View>
      );
  };


  const renderDrinkingSession = ( {item} : {item: DrinkingSessionData}) => {
    return(
      <DrinkingSession
        session = {item}
      />
    );
  };

    const testRemoveFirstSession = async () => {
    try {
      if (drinkingSessionIds != null){
        const sessionKeys = Object.keys(drinkingSessionIds);
        const lastSessionId = sessionKeys[0];
        console.log(sessionKeys);
        console.log(lastSessionId);
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
            <FlatList
              data = {drinkingSessionData}
              renderItem={renderDrinkingSession}
              keyExtractor={item => item.session_id}
            />
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