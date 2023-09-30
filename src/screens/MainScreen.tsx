import 
  React,
{
  useState,
  useContext,
  useEffect,
} from 'react';
import { 
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import SessionsCalendar from '../components/Calendar';
import LoadingData from '../components/LoadingData';
import DatabaseContext from '../context/DatabaseContext';
import { listenForDataChanges, readDataOnce } from "../database/baseFunctions";
import { CurrentSessionData, DrinkingSessionArrayItem, DrinkingSessionData, PreferencesData, UnconfirmedDaysData, UnitTypesProps, UserData } from '../types/database';
import { MainScreenProps } from '../types/screens';
import { DateObject } from '../types/components';
import { getAuth, signOut } from 'firebase/auth';
import { dateToDateObject, getZeroUnitsObject, calculateThisMonthUnits, findOngoingSession, calculateThisMonthPoints } from '../utils/dataHandling';
import { useUserConnection } from '../context/UserConnectionContext';
import UserOffline from '../components/UserOffline';
import { updateUserLastOnline } from '../database/users';
import { saveDrinkingSessionData, updateCurrentSessionKey } from '../database/drinkingSessions';
import { getDatabaseData } from '../context/DatabaseDataContext';

const MainScreen = ( { navigation }: MainScreenProps) => {
  // Context, database, and authentification
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);
  const { isOnline } = useUserConnection();
  const { 
    currentSessionData,
    drinkingSessionData,
    drinkingSessionKeys,
    preferences,
    unconfirmedDays,
    userData,
    isLoading
  } = getDatabaseData();
  
  const [visibleDateObject, setVisibleDateObject] = useState<DateObject>(
    dateToDateObject(new Date()));
  const [thisMonthUnits, setThisMonthUnits] = useState<number>(0);
  const [thisMonthPoints, setThisMonthPoints] = useState<number>(0);
  const [loadingNewSession, setLoadingNewSession] = useState<boolean>(false);
   
  // Handle drinking session button press
  const startDrinkingSession = async () => {
    if (!preferences || !db || !user) return null; // Should never be null 
    let sessionData:DrinkingSessionArrayItem;
    let sessionKey:string;
    let ongoingSession = findOngoingSession(drinkingSessionData);
    if (!ongoingSession){
      setLoadingNewSession(true);
      // The user is not in an active session
      sessionData = {
        start_time: Date.now(),
        end_time: Date.now(), // Will be overwritten
        blackout: false,
        note: '',
        units: {
          [Date.now()]: {other: 0} // Necessary placeholder, will be deleted
        },
        ongoing: true
      };
      try {
        // Create a new session and return its session key
        sessionKey = await saveDrinkingSessionData(db, user.uid, sessionData);
      } catch (error:any) {
        throw new Error("Failed to create a new key in the database");
      };
      try {
        // Create a new session and return its session key
        await updateCurrentSessionKey(db, user.uid, sessionKey);
      } catch (error:any) {
        throw new Error("Failed to update the current session key info");
      };
    } else {
      if (!currentSessionData) return null; // Should never be null with ongoing session
      // The user already has an active session
      sessionData = ongoingSession;
      if (!currentSessionData.current_session_id){
        throw new Error("There is no active data key in the database");
      };
      sessionKey = currentSessionData.current_session_id;
    };
    navigation.navigate("Drinking Session Screen", {
      session: sessionData,
      sessionKey: sessionKey,
      preferences: preferences
    });
    setLoadingNewSession(false);
  }

  // Update the user last login time
  useEffect(() => {
    const fetchData = async () => {
      if (!db || !user) return;
      try {
        await updateUserLastOnline(db, user.uid);
      } catch (error:any) {
        Alert.alert("Failed to contact the database", "Could not update user online status:" + error.message);
      }
    };

    fetchData();
  }, []);

  // Monitor visible month and various statistics
  useEffect(() => {
    if (!preferences) return;
    let thisMonthUnits = calculateThisMonthUnits(visibleDateObject, drinkingSessionData);
    let thisMonthPoints = calculateThisMonthPoints(visibleDateObject, drinkingSessionData, preferences.units_to_points);
    
    setThisMonthPoints(thisMonthPoints);
    setThisMonthUnits(thisMonthUnits);
  }, [drinkingSessionData, visibleDateObject]);


  if (!user) {
    navigation.replace("Auth", {screen: "Login Screen"});
    return;
  }
  if (!isOnline) return <UserOffline />;
  if (isLoading || loadingNewSession) return <LoadingData loadingText={loadingNewSession ? 'Starting a new session...' : ''} />;
  if (!db || !preferences || !drinkingSessionData || !userData) return;

  return ( 
    <>
      <View style={styles.mainHeader}>
          <View style={styles.profileContainer}>
            <TouchableOpacity
              onPress = {() => navigation.navigate('Profile Screen')}
              style={styles.profileButton}
            >
              <MenuIcon 
                iconId='profile-icon'
                iconSource={require('../assets/temp/user.png')}  // user.photoURL;
                containerStyle={styles.profileIconContainer}
                iconStyle={styles.profileIcon}
                onPress = {() => navigation.navigate('App', {screen: 'Profile Screen'})}
                />
              <Text style={styles.headerUsername}>{user.displayName}</Text> 
            </TouchableOpacity>
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
                iconId='main-menu-popup-icon'
                iconSource={require('../assets/icons/menu.png')} 
                containerStyle={styles.menuIconContainer}
                iconStyle={styles.menuIcon}
                onPress = {() => navigation.navigate('Main Menu Screen', {
                  userData: userData,
                  preferences: preferences
                })}
              />
          </View>
      </View>
      <ScrollView style={styles.mainScreenContent}>
          {currentSessionData?.current_session_id ?
          <TouchableOpacity 
            style={styles.userInSessionWarningContainer}
            onPress={startDrinkingSession}
            >
              <Text style={styles.userInSessionWarningText}>
              You are currently in session!
              </Text> 
          </TouchableOpacity>
          :
          <></>
          } 
          <View style={styles.menuInfoContainer}>
            <View style={styles.menuInfoItemContainer}>
              <Text style={styles.menuInfoText}>Units this month:</Text> 
              <Text style={styles.menuInfoText}>{thisMonthUnits}</Text> 
            </View>
            <View style={styles.menuInfoItemContainer}>
              <Text style={styles.menuInfoText}>Points this month:</Text> 
              <Text style={styles.menuInfoText}>{thisMonthPoints}</Text> 
            </View>
          </View>
          {/* Replace this with the overview and statistics */}
          <SessionsCalendar
            drinkingSessionData = {drinkingSessionData}
            preferences = {preferences}
            visibleDateObject={visibleDateObject}
            setVisibleDateObject={setVisibleDateObject}
            onDayPress = {(day:DateObject) => {
              navigation.navigate('Day Overview Screen', { dateObject: day })
            }}
          />
      </ScrollView>
      {currentSessionData?.current_session_id ? <></> :
      <BasicButton 
        text='+'
        buttonStyle={styles.startSessionButton}
        textStyle={styles.startSessionText}
        onPress = {startDrinkingSession} />
      }
    </>
  );
};
   

export default MainScreen;

const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  profileContainer: {
    //Ensure the container fills all space between, no more, no less
    flexGrow: 1,
    flexShrink: 1,
  },
  profileButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    flex: 1,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
  },
  headerUsername: {
    flexWrap: 'wrap',
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
    marginLeft: 10,
    alignSelf: 'center',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 150,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 25,
    height: 25,
    padding: 10,
  },
  mainScreenContent: {
    flexGrow:1, 
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  ///
  userInSessionWarningContainer: {
    backgroundColor: '#ff5d54',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    alignItems: "center",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInSessionWarningText: {
    fontSize: 22,
    color: '#ffffff', // White color for the text
    fontWeight: 'bold',
  },
  menuInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#FFFF99',
    width: '100%',
  },
  menuInfoItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFF99',
    width: '100%',
  },
  menuInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    alignSelf: "center",
    // alignContent: "center",
    padding: 10,
  },
  thisMonthUnitsText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "black",
    alignSelf: "center",
    alignContent: "center",
  },
  startSessionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
  },
  startSessionText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  // startSessionButton: {
  //   position: 'absolute',
  //   bottom: 20,
  //   right: 20,
  //   borderRadius: 50,
  //   width: 70,
  //   height: 70,
  //   backgroundColor: 'green',
  //   alignItems: 'center',
  // },
  // startSessionText: {
  //   color: 'white',
  //   fontSize: 50,
  //   fontWeight: 'bold',
  //   textAlign: 'center'
  // },
});