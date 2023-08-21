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
import { formatDateToDay, formatDateToTime, sumAllUnits, timestampToDate } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';
import { DrinkingSessionData, UnitTypesProps } from '../types/database';
import DrinkingSessionUnitWindow from '../components/DrinkingSessionUnitWindow';


const DrinkingSessionScreen = ({ route, navigation}: DrinkingSessionScreenProps) => {
  if (!route || ! navigation) return null; // Should never be null
  const { current_session_data }  = route.params;
  const { current_units, in_session, last_session_started, last_unit_added } = current_session_data;
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);
  // Units
  const [totalUnits, setTotalUnits] = useState<number>(sumAllUnits(current_units));
  const [beerUnits, setBeerUnits] = useState(current_units.beer)
  const [cocktailUnits, setCocktailUnits] = useState(current_units.cocktail)
  const [otherUnits, setOtherUnits] = useState(current_units.other)
  const [strongShotUnits, setStrongShotUnits] = useState(current_units.strong_shot)
  const [weakShotUnits, setWeakShotUnits] = useState(current_units.weak_shot)
  const [wineUnits, setWineUnits] = useState(current_units.wine)
  // Time info
  const [lastUnitAdded, setLastUnitAdded] = useState<number>(last_unit_added);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const updateTimeout = 1000; // Synchronize with DB every x milliseconds
  const sessionDate = timestampToDate(last_session_started);
  const sessionDay = formatDateToDay(sessionDate);
  const sessionStartTime = formatDateToTime(sessionDate);


  // Automatically navigate to login screen if login expires
  if (user == null){
    navigation.replace("Login Screen");
    return null;
  }

  // Change local hook value
  const changeTotalUnits = (number: number) => {
    const newUnits = totalUnits + number;
    if (newUnits >= 0 && newUnits < 100){
      setOtherUnits(newUnits);
      setTotalUnits(newUnits);
    }
  };

  // Create a ref to store the previous state
  const prevUnitsRef = useRef<number>();
    useEffect(() => {
      prevUnitsRef.current = totalUnits;
    });
  const prevUnits = prevUnitsRef.current;

  // Change database value once every second
  useEffect(() => {
    // Only schedule a database update if the units have changed
    if (prevUnits !== totalUnits) {
      let newCurrentUnits:UnitTypesProps = {
        beer: beerUnits,
        cocktail: cocktailUnits,
        other: otherUnits,
        strong_shot: strongShotUnits,
        weak_shot: weakShotUnits,
        wine: wineUnits,
      };
      setPendingUpdate(true);
      const timer = setTimeout(async () => {
        await updateCurrentUnits(db, user.uid, newCurrentUnits);
        setPendingUpdate(false); // Data has been synchronized with DB
      }, updateTimeout); // Update every x milliseconds
      // Clear timer on unmount or when units changes
      return () => clearTimeout(timer);
    }
  }, [totalUnits]);


  async function saveSession(db: any, userId: string) {
    // Save the data into the database
    if (totalUnits > 0){
      let unitsToSave:UnitTypesProps = {
        beer: beerUnits,
        cocktail: cocktailUnits,
        other: otherUnits,
        strong_shot: strongShotUnits,
        weak_shot: weakShotUnits,
        wine: wineUnits,
      }
      let newSessionData: DrinkingSessionData = {
        end_time: Date.now(),
        last_unit_added_time: lastUnitAdded,
        session_id: 'placeholder-id', // Will be replaced during the call
        start_time: last_session_started,
        units: unitsToSave
      };
      try {
        await saveDrinkingSessionData(db, userId, newSessionData); // Save drinking session data
      } catch (error:any) {
        throw new Error('Failed to save drinking session data: ' + error.message);
      }
      // Show statistics, offer to go back
      if (navigation){
        navigation.goBack();
      } else {
        throw new Error('Navigation not found');
      }
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
    if (navigation){
      navigation.goBack();
    } else {
      throw new Error('Navigation not found');
    };
  }

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (pendingUpdate) {
      let currentUnits:UnitTypesProps = {
        beer: beerUnits,
        cocktail: cocktailUnits,
        other: otherUnits,
        strong_shot: strongShotUnits,
        weak_shot: weakShotUnits,
        wine: wineUnits,
      }
      await updateCurrentUnits(db, user.uid, currentUnits);
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
      <View style={styles.sessionInfoContainer}>
          {/* <Text style={styles.menuDrinkingSessionInfoText}>
              {sessionDay}
          </Text> */}
          <Text style={styles.menuDrinkingSessionInfoText}>
              {sessionStartTime}
          </Text>
      </View>
      <View style={styles.totalUnitsContainer}>
        <SessionUnitsInputWindow
          currentUnits={totalUnits}
          onUnitsChange={setTotalUnits}
        />
      </View>
      <View style={styles.unitTypesContainer}>
        <DrinkingSessionUnitWindow
          unitName='Beer'
          iconSource={require('../assets/icons/beer.png')}
          currentUnits={beerUnits}
          onUnitsChange={setBeerUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Wine'
          iconSource={require('../assets/icons/wine.png')}
          currentUnits={wineUnits}
          onUnitsChange={setWineUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Weak Shot'
          iconSource={require('../assets/icons/weak_shot.png')}
          currentUnits={weakShotUnits}
          onUnitsChange={setWeakShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Strong Shot'
          iconSource={require('../assets/icons/strong_shot.png')}
          currentUnits={strongShotUnits}
          onUnitsChange={setStrongShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Cocktail'
          iconSource={require('../assets/icons/cocktail.png')}
          currentUnits={cocktailUnits}
          onUnitsChange={setCocktailUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Other'
          iconSource={require('../assets/icons/alcohol_assortment.png')}
          currentUnits={otherUnits}
          onUnitsChange={setOtherUnits}
        />
      </View>
      <View style={styles.otherButtonsContainer}>
        <BasicButton 
          text='Add Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => changeTotalUnits(1)}
        />
        <BasicButton 
          text='Remove Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => changeTotalUnits(-1)}
        />
        <BasicButton 
          text='Save Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => saveSession(db, user.uid)}
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
  sessionInfoContainer: {

  },
  totalUnitsContainer: {
    alignItems: "center",
    justifyContent: "center",

  },
  unitTypesContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  otherButtonsContainer: {
    alignItems: "center",
    justifyContent: "center",
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