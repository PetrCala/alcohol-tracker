import 
  React,
{
  useState,
  useContext,
  useEffect,
} from 'react';
import { 
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BasicButton from '../components/Buttons/BasicButton';
import MenuIcon from '../components/Buttons/MenuIcon';
import SessionsCalendar from '../components/Calendar';
import LoadingData from '../components/LoadingData';
import YesNoPopup from '../components/YesNoPopup';
import DatabaseContext from '../database/DatabaseContext';
import { listenForDataChanges } from "../database/baseFunctions";
import { updateDrinkingSessionUserData } from '../database/drinkingSessions';
import { UserDataProps, DrinkingSessionData } from '../types/database';
import { MainScreenProps } from '../types/screens';
import { DateObject } from '../types/various';
import { deleteUser, getAuth, signOut, reauthenticateWithCredential } from 'firebase/auth';
import { dateToDateObject, getSingleMonthDrinkingSessions, timestampToDate } from '../utils/dataHandling';

const MainScreen = ( { navigation }: MainScreenProps) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | []>([]); // Data
  const [visibleDateObject, setVisibleDateObject] = useState<DateObject>(
    dateToDateObject(new Date())
    );
  const [thisMonthUnits, setThisMonthUnits] = useState<number>(0);
  const [loadingUserData, setUserLoadingData] = useState<boolean>(true);
  const [loadingSessionData, setLoadingSessionData] = useState<boolean>(true);
  // const [deleteUserPopupVisible, setDeleteUserPopupVisible] = useState<boolean>(false);

  // Automatically navigate to login screen if login expires
  if (user == null){
    navigation.replace("Login Screen");
    return null;
  }

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
    try {
      // TODO
      // reauthenticateWithCredential
      await signOut(auth);
      navigation.replace("Login Screen");
    } catch (error:any) {
      throw new Error("There was an error signing out: " + error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(user);
      navigation.replace("Login Screen");
    } catch (error:any) {
      throw new Error("There was an error deleting the user: " + error.message);
    }
  };

  const calculateThisMonthUnits = (dateObject: DateObject, sessions: DrinkingSessionData[]) => {
    // Subset to this month's sessions only
    const currentDate = timestampToDate(dateObject.timestamp);
    const sessionsThisMonth = getSingleMonthDrinkingSessions(
      currentDate, sessions, false
    );
    // Sum up the units
    return sessionsThisMonth.reduce((sum, session) => sum + session.units, 0);
  };

  // Monitor user data
  useEffect(() => {
    let userRef = `users/${user.uid}`
    let stopListening = listenForDataChanges(db, userRef, (data:UserDataProps) => {
      setUserData(data);
      setUserLoadingData(false);
    });

    return () => stopListening();

    }, [db, user]);

  // Monitor drinking session data
  useEffect(() => {
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

  }, [db, user]); // Re-run effect when userId or db changes

  // Monitor visible month and various statistics
  useEffect(() => {
    let thisMonthUnits = calculateThisMonthUnits(visibleDateObject, drinkingSessionData);
    setThisMonthUnits(thisMonthUnits);

  }, [drinkingSessionData, visibleDateObject]);


  // Wait for the user data to be fetched from database
  if (loadingUserData || loadingSessionData) {
    return(
      <LoadingData
      loadingText="Loading data..."
      />
    );
  };
    
  return (
    <View style={styles.mainContainer}>
        <View style={styles.mainHeader}>
            <View style={styles.profileIconContainer}>
                {/* User's clickable icon */}
                <MenuIcon 
                  iconId='profile-icon'
                  iconSource={require('../assets/temp/user.png')}  // user.photoURL;
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
                  iconId='sign-out'
                  iconSource={require('../assets/icons/exit.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress = {handleSignOut}
                  // onPress = {() => navigation.navigate('Settings Screen')}
                  />
                {/* <MenuIcon 
                  iconId='menu-icon'
                  iconSource={require('../assets/icons/delete.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress = {handleDeleteUser}
                /> */}
                {/* <YesNoPopup
                  visible={deleteUserPopupVisible}
                  onRequestClose={() => setDeleteUserPopupVisible(false)}
                  message="Do you really want delete this user?"
                  onYes={handleDeleteUser}
                  onNo={setDeleteUserPopupVisible(false)}
                /> */}
            </View>
        </View>
        <View style={styles.mainScreenContent}>
            {userData?.in_session ?
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
            <Text style={styles.menuDrinkingSessionInfoText}>Units this month:</Text> 
            <Text style={styles.thisMonthUnitsText}>{thisMonthUnits}</Text> 
            {/* Replace this with the overview and statistics */}
            {drinkingSessionData ?
            <SessionsCalendar
              drinkingSessionData = {drinkingSessionData}
              visibleDateObject={visibleDateObject}
              setVisibleDateObject={setVisibleDateObject}
              onDayPress = {(day:DateObject) => {
                navigation.navigate('Day Overview Screen',
                { timestamp: day.timestamp }
                )
              }}
            />
            :
            <Text style={styles.menuDrinkingSessionInfoText}>No drinking sessions found</Text>
            }
            {userData?.in_session ? <></> :
            <BasicButton 
              text='+'
              buttonStyle={styles.startSessionButton}
              textStyle={styles.startSessionText}
              onPress = {startDrinkingSession} />
            }
        </View>
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
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
  },
  headerUsernameContainer: {
    //Ensure the container fills all space between, no more, no less
    flexGrow: 1,
    flexShrink: 1,
    //other
    justifyContent: 'center',
    paddingLeft: 10,
  },
  headerUsername: {
    flexWrap: 'wrap',
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
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
    flex: 1,
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
  menuDrinkingSessionInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    color: "black",
    alignSelf: "center",
    alignContent: "center",
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
});