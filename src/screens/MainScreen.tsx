import 
  React,
{
  useState,
  useContext,
  useEffect,
} from 'react';
import { 
  Alert,
  StyleSheet,
  Text,
  Touchable,
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
import { CurrentSessionData, DrinkingSessionData, PreferencesData, UnconfirmedDaysData, UnitTypesProps } from '../types/database';
import { MainScreenProps } from '../types/screens';
import { DateObject } from '../types/components';
import { deleteUser, getAuth, signOut, reauthenticateWithCredential } from 'firebase/auth';
import { dateToDateObject, getRandomUnitsObject, getSingleMonthDrinkingSessions, getZeroUnitsObject, sumAllUnits, timestampToDate } from '../utils/dataHandling';
import { deleteUserInfo } from '../database/users';

const MainScreen = ( { navigation }: MainScreenProps) => {
  // Context, database, and authentification
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);
  // const [userData, setUserData] = useState<UserData | null>(null);
  // Database data hooks
  const [currentSessionData, setCurrentSessionData] = useState<CurrentSessionData | null>(null);
  const [drinkingSessionData, setDrinkingSessionData] = useState<DrinkingSessionData[] | []>([]);
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [unconfirmedDays, setUnconfirmedDays] = useState<UnconfirmedDaysData | null>(null);
  // Other hooks
  const [visibleDateObject, setVisibleDateObject] = useState<DateObject>(
    dateToDateObject(new Date())
    );
    const [thisMonthUnits, setThisMonthUnits] = useState<number>(0);
    const [signoutModalVisible, setSignoutModalVisible] = useState<boolean>(false);
  // Loading hooks
  const [loadingCurrentSessionData, setLoadingCurrentSessionData] = useState<boolean>(true);
  const [loadingDrinkingSessionData, setLoadingDrinkingSessionData] = useState<boolean>(true);
  const [loadingUserPreferences, setLoadingUserPreferences] = useState<boolean>(true);
  const [loadingUnconfirmedDays, setLoadingUnconfirmedDays] = useState<boolean>(true);

  // const [deleteUserPopupVisible, setDeleteUserPopupVisible] = useState<boolean>(false);

  // Automatically navigate to login screen if login expires
  if (user == null){
    navigation.replace("Login Screen");
    return null;
  }

  // Handle drinking session button press
  const startDrinkingSession = async () => {
    if (currentSessionData == null){
      throw new Error("The user" + user.displayName + " has no data in the database.")
    }
    if (!preferences) return null; // Should never be null
    let startingUnits = currentSessionData.current_units;
    let sessionStartTime = currentSessionData.last_session_started;
    if (!currentSessionData.in_session){
      let startingUnits: UnitTypesProps = getZeroUnitsObject();
      sessionStartTime = Date.now();
      let updates: {[key: string]: any} = {};
      updates[`user_current_session/${user.uid}/current_units`] = startingUnits;
      updates[`user_current_session/${user.uid}/in_session`] = true;
      updates[`user_current_session/${user.uid}/last_session_started`] = sessionStartTime;
      updates[`user_current_session/${user.uid}/last_unit_added`] = sessionStartTime;
      try {
        await updateDrinkingSessionUserData(db, updates);
      } catch (error: any) {
          Alert.alert('Could not start new session', 'Failed to start a new session: ' + error.message);
      }
    }
    navigation.navigate("Drinking Session Screen", {
      current_session_data: {
        current_units: startingUnits,
        in_session: true,
        last_session_started: sessionStartTime,
        last_unit_added: sessionStartTime
      },
      preferences: preferences
    });
  }

  const handleSignOut = async () => {
    try {
      // TODO
      // reauthenticateWithCredential
      await signOut(auth);
    } catch (error:any) {
      throw new Error("There was an error signing out: " + error.message);
    }
  };
  
  const handleConfirmSignout = () => {
    handleSignOut();
    setSignoutModalVisible(false);
    navigation.replace("Login Screen");
  };

  const handleCancelSignout = () => {
    setSignoutModalVisible(false);
  };

  const handleDeleteUser = async () => {
    // Delete the user's information from the realtime database
    try {
        await deleteUserInfo(db, user.uid);
    } catch (error:any) {
      return Alert.alert('Could not delete user info from database', 'Deleting the users info from realtime database failed: ' + error.message);
    }
    // Delete user from authentification database
    try {
      await deleteUser(user);
      navigation.replace("Login Screen");
    } catch (error:any) {
      return Alert.alert('Error deleting user', 'Could not delete user ' + user.uid + error.message);
    }
  };

  const calculateThisMonthUnits = (dateObject: DateObject, sessions: DrinkingSessionData[]) => {
    // Subset to this month's sessions only
    const currentDate = timestampToDate(dateObject.timestamp);
    const sessionsThisMonth = getSingleMonthDrinkingSessions(
      currentDate, sessions, false
    );
    // Sum up the units
    return sessionsThisMonth.reduce((sum, session) => sum + sumAllUnits(session.units), 0);
  };

  // Monitor current session data
  useEffect(() => {
    let userRef = `user_current_session/${user.uid}`
    let stopListening = listenForDataChanges(db, userRef, (data:CurrentSessionData) => {
      setCurrentSessionData(data);
      setLoadingCurrentSessionData(false);
    });

    return () => stopListening();

  }, [db, user]);

  // Monitor drinking session data
  useEffect(() => {
    // Start listening for changes when the component mounts
    let sessionsRef = `user_drinking_sessions/${user.uid}`
    let stopListening = listenForDataChanges(db, sessionsRef, (data:any) => {
      let newDrinkingSessionData:DrinkingSessionData[] = []; // Handles cases with no data
      if (data != null){
        newDrinkingSessionData = Object.values(data); // To an array
      }
      setDrinkingSessionData(newDrinkingSessionData);
      setLoadingDrinkingSessionData(false);
    });

    // Stop listening for changes when the component unmounts
    return () => {
      stopListening();
    };

  }, [db, user]); // Re-run effect when userId or db changes

  // Monitor user preferences
  useEffect(() => {
    let userRef = `user_preferences/${user.uid}`
    let stopListening = listenForDataChanges(db, userRef, (data:PreferencesData) => {
      setPreferences(data);
      setLoadingUserPreferences(false);
    });

    return () => stopListening();

  }, [db, user]);

  // Monitor unconfirmed days
  useEffect(() => {
    let userRef = `user_unconfirmed_days/${user.uid}`
    let stopListening = listenForDataChanges(db, userRef, (data:UnconfirmedDaysData) => {
      if (data){ // Might be null
        setUnconfirmedDays(data);
      }
      setLoadingUnconfirmedDays(false);
    });

    return () => stopListening();

  }, [db, user]);

  // Monitor visible month and various statistics
  useEffect(() => {
    let thisMonthUnits = calculateThisMonthUnits(visibleDateObject, drinkingSessionData);
    setThisMonthUnits(thisMonthUnits);

  }, [drinkingSessionData, visibleDateObject]);


  // Wait for the user data to be fetched from database
  if (
    loadingCurrentSessionData || 
    loadingDrinkingSessionData ||
    loadingUserPreferences ||
    loadingUnconfirmedDays) {

    return(
      <LoadingData
      // loadingText="Loading data..."
      />
      );
  };

  // Should never be null
  if (!currentSessionData || !drinkingSessionData || !preferences) return null;

  return (
    <View style={styles.mainContainer}>
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
                  onPress = {() => {}}
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
                  iconId='sign-out'
                  iconSource={require('../assets/icons/exit.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress = {() => setSignoutModalVisible(true)}
                  // onPress = {() => navigation.navigate('Settings Screen')}
                />
                <YesNoPopup
                  visible={signoutModalVisible}
                  transparent={true}
                  onRequestClose={() => setSignoutModalVisible(false)}
                  message={"Do you really want to\nsign out?"}
                  onYes={handleConfirmSignout}
                  onNo={handleCancelSignout}
                />
                {/* <MenuIcon 
                  iconId='menu-icon'
                  iconSource={require('../assets/icons/delete.png')} 
                  containerStyle={styles.menuIconContainer}
                  iconStyle={styles.menuIcon}
                  onPress = {handleDeleteUser}
                /> */}
            </View>
        </View>
        <View style={styles.mainScreenContent}>
            {currentSessionData?.in_session ?
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
              preferences = {preferences}
              visibleDateObject={visibleDateObject}
              setVisibleDateObject={setVisibleDateObject}
              onDayPress = {(day:DateObject) => {
                navigation.navigate('Day Overview Screen',
                { 
                  date_object: day,
                  preferences: preferences
                }
                )
              }}
            />
            :
            <Text style={styles.menuDrinkingSessionInfoText}>No drinking sessions found</Text>
            }
            {currentSessionData?.in_session ? <></> :
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