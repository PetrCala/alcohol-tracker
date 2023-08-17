import React, {
  useRef,
  useState,
  useContext,
  useEffect
} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { DrinkingSessionScreenProps } from '../types/screens';
import DatabaseContext from '../database/DatabaseContext';
import { updateCurrentUnits, discardDrinkingSessionData } from '../database/users';
import { saveDrinkingSessionData } from '../database/drinkingSessions';
import SessionUnitsInputWindow from '../components/Buttons/SessionUnitsInputWindow';
import { formatDateToDay, formatDateToTime, timestampToDate } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';

const DrinkingSessionScreen = ({ route, navigation}: DrinkingSessionScreenProps) => {
  const { current_units, timestamp } = route.params;
  const auth = getAuth();
  const user = auth.currentUser;
  const [units, setUnits] = useState(current_units);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const sessionDate = timestampToDate(timestamp);
  const sessionDay = formatDateToDay(sessionDate);
  const sessionTime = formatDateToTime(sessionDate);
  const db = useContext(DatabaseContext);
  const updateTimeout = 1000; // Synchronize with DB every x milliseconds


  // Automatically navigate to login screen if login expires
  if (user == null){
    navigation.replace("Login Screen");
    return null;
  }

  // Change local hook value
  const changeUnits = (number: number) => {
    const newUnits = units + number;
    if (newUnits >= 0 && newUnits < 100){
      setUnits(newUnits);
    }
  };

  // Create a ref to store the previous state
  const prevUnitsRef = useRef<number>();
    useEffect(() => {
      prevUnitsRef.current = units;
    });
  const prevUnits = prevUnitsRef.current;

  // Change database value once every second
  useEffect(() => {
    // Only schedule a database update if the units have changed
    if (prevUnits !== units) {
      setPendingUpdate(true);
      const timer = setTimeout(async () => {
        await updateCurrentUnits(db, user.uid, units);
        setPendingUpdate(false); // Data has been synchronized with DB
      }, updateTimeout); // Update every x milliseconds
      // Clear timer on unmount or when units changes
      return () => clearTimeout(timer);
    }
  }, [units]);


  async function saveSession(db: any, userId: string, units: number, timestamp: number) {
    // Save the data into the database
    if (units > 0){
      try {
        await saveDrinkingSessionData(db, userId, units, timestamp); // Save drinking session data
      } catch (error:any) {
        throw new Error('Failed to save drinking session data: ' + error.message);
      }
      // Show statistics, offer to go back
      setUnits(0);
      navigation.goBack();
    }
  };

  /** Discard the current session, reset current units and 
   * session status, and navigate to main menu.
   */
  async function discardSession(db: any, userId: string){
    try {
      await discardDrinkingSessionData(db, userId); 
    } catch (error:any) {
      throw new Error('Failed to discard the session: ' + error.message);
    }
    setUnits(0);
    navigation.goBack();
  }

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (pendingUpdate) {
      await updateCurrentUnits(db, user.uid, units);
    }
    navigation.goBack();
  };

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-drinking-session'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={handleBackPress}
        />
      </View>
      <View>
            <Text style={styles.menuDrinkingSessionInfoText}>
                {sessionDay}
            </Text>
            <Text style={styles.menuDrinkingSessionInfoText}>
                {sessionTime}
            </Text>
        </View>
      <View style={styles.drinkingSessionContainer}>
        <SessionUnitsInputWindow
          currentUnits={units}
          onUnitsChange={setUnits}
        />
        <BasicButton 
          text='Add Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => changeUnits(1)}
        />
        <BasicButton 
          text='Remove Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => changeUnits(-1)}
        />
        <BasicButton 
          text='Save Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => saveSession(db, user.uid, units, timestamp)}
        />
        <BasicButton 
          text='Discard Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => discardSession(db, user.uid)}
        />
      </View>
    </View>
  );
};

export default DrinkingSessionScreen;


const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  backArrowContainer: {
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    position: 'absolute',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  drinkingSessionContainer: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 90, //offset header
  },
  drinkingSessionButton: {
    width: 130,
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: '#007AFF'
  },
  drinkingSessionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  menuDrinkingSessionInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    color: "black",
    alignSelf: "center",
    alignContent: "center",
    padding: 10,
  },
});