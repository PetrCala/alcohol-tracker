import React, {
  useRef,
  useState,
  useContext,
  useEffect
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { DrinkingSessionScreenProps } from '../types/screens';
import DatabaseContext from '../context/DatabaseContext';
import { updateCurrentUnits, discardDrinkingSessionData } from '../database/users';
import { saveDrinkingSessionData, updateCurrentSessionKey } from '../database/drinkingSessions';
import SessionUnitsInputWindow from '../components/Buttons/SessionUnitsInputWindow';
import { formatDateToDay, formatDateToTime, sumAllUnits, timestampToDate, unitsToColors } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';
import { DrinkingSessionArrayItem, DrinkingSessionData, UnitTypesProps } from '../types/database';
import DrinkingSessionUnitWindow from '../components/DrinkingSessionUnitWindow';
import { maxAllowedUnits } from '../utils/static';
import YesNoPopup from '../components/Popups/YesNoPopup';
import { useUserConnection } from '../context/UserConnectionContext';
import UserOffline from '../components/UserOffline';


const DrinkingSessionScreen = ({ route, navigation}: DrinkingSessionScreenProps) => {
  // Navigation
  if (!route || ! navigation) return null; // Should never be null
  const { session, sessionKey, preferences }  = route.params;
  // Context, database, and authentification
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);
  const { isOnline } = useUserConnection();
  // Units
  const [totalUnits, setTotalUnits] = useState<number>(sumAllUnits(session.units));
  const [availableUnits, setAvailableUnits] = useState<number>(maxAllowedUnits - totalUnits);
  // const [beerUnits, setBeerUnits] = useState(current_units.beer)
  // const [cocktailUnits, setCocktailUnits] = useState(current_units.cocktail)
  // const [otherUnits, setOtherUnits] = useState(current_units.other)
  // const [strongShotUnits, setStrongShotUnits] = useState(current_units.strong_shot)
  // const [weakShotUnits, setWeakShotUnits] = useState(current_units.weak_shot)
  // const [wineUnits, setWineUnits] = useState(current_units.wine)
  const [beerUnits, setBeerUnits] = useState(0)
  const [cocktailUnits, setCocktailUnits] = useState(0)
  const [otherUnits, setOtherUnits] = useState(0)
  const [strongShotUnits, setStrongShotUnits] = useState(0)
  const [weakShotUnits, setWeakShotUnits] = useState(0)
  const [wineUnits, setWineUnits] = useState(0)
  const allUnits:UnitTypesProps = {
    beer: beerUnits,
    cocktail: cocktailUnits,
    other: otherUnits,
    strong_shot: strongShotUnits,
    weak_shot: weakShotUnits,
    wine: wineUnits,
  };
  // Time info
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const updateTimeout = 1000; // Synchronize with DB every x milliseconds
  const sessionDate = timestampToDate(session.start_time);
  const sessionDay = formatDateToDay(sessionDate);
  const sessionStartTime = formatDateToTime(sessionDate);
  // Other
  const [monkeMode, setMonkeMode] = useState<boolean>(false);
  const [discardModalVisible, setDiscardModalVisible] = useState<boolean>(false);
  const sessionColor = unitsToColors(totalUnits, preferences.units_to_colors);


  // Automatically navigate to login screen if login expires
  if (user == null){
    navigation.replace("Login Screen");
    return null;
  }

  // Change local hook value
  const addOtherUnit = (number: number) => {
    let newUnits = otherUnits + number;
    if (newUnits >= 0 && newUnits < 100){
      setOtherUnits(newUnits);
    }
  };

  const resetAllUnits = () => {
    setBeerUnits(0);
    setCocktailUnits(0);
    setOtherUnits(0);
    setStrongShotUnits(0);
    setWeakShotUnits(0);
    setWineUnits(0);
  };

  // Track total units
  useEffect(() => {
      let allUnitsSum = sumAllUnits(allUnits);
      setTotalUnits(allUnitsSum);
  }, [allUnits]);

  // Track available units
  useEffect(() => {
    let newAvailableUnits = maxAllowedUnits - totalUnits;
    setAvailableUnits(newAvailableUnits);
  }, [totalUnits]);

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
      setPendingUpdate(true);
      const timer = setTimeout(async () => {
        await updateCurrentUnits(db, user.uid, allUnits);
        setPendingUpdate(false); // Data has been synchronized with DB
      }, updateTimeout); // Update every x milliseconds
      // Clear timer on unmount or when units changes
      return () => clearTimeout(timer);
    }
  }, [totalUnits]);


  async function finishSession(db: any, userId: string) {
    if (totalUnits > 99){
      console.log('Cannot save this session');
      return null;
    };
    // Should not happen
    if (!navigation){
      Alert.alert('Navigation not found', 'Failed to fetch the navigation');
      return null;
    };
    // Save the data into the database
    if (totalUnits > 0){
      let newSessionData: DrinkingSessionArrayItem = {
        start_time: session.start_time,
        end_time: Date.now(),
        units: allUnits,
        ongoing: null,
      };
      try {
        await saveDrinkingSessionData(db, userId, newSessionData, sessionKey); // Save drinking session data
      } catch (error:any) {
        throw new Error('Failed to save drinking session data: ' + error.message);
      };
      try {
        await updateCurrentSessionKey(db, userId, null); // Remove the current session id info
      } catch (error:any) {
        throw new Error('Failed to save drinking session data: ' + error.message);
      };
      // Reset all units
      resetAllUnits();
      // Reroute to session summary, do not allow user to return
      navigation.replace("Session Summary Screen", {
        session: newSessionData,
        preferences: preferences
      });
    };
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
  }
  
  const handleConfirmDiscard = () => {
    discardSession(db, user.uid);
    setDiscardModalVisible(false);
    navigation.goBack();
  };

  const handleCancelDiscard = () => {
    setDiscardModalVisible(false);
  };

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (pendingUpdate) {
      await updateCurrentUnits(db, user.uid, allUnits);
    }
    navigation.goBack();
  };

  if (!isOnline) return (<UserOffline/>);

  return (
    <>
    <View style={styles.mainHeader}>
      <MenuIcon
        iconId='escape-drinking-session'
        iconSource={require('../assets/icons/arrow_back.png')}
        containerStyle={styles.backArrowContainer}
        iconStyle={styles.backArrow}
        onPress={handleBackPress}
      />
      <BasicButton 
        text= {monkeMode ? 'Exit Monke Mode': 'Monke Mode'}
        buttonStyle={[
          styles.monkeModeButton,
          monkeMode ?  styles.monkeModeButtonEnabled : {}
        ]}
        textStyle={styles.monkeModeButtonText}
        onPress={() => setMonkeMode(!monkeMode)}
      />
    </View>
    <View style={styles.sessionInfoContainer}>
        <Text style={styles.sessionInfoText}>
            {sessionDay} {sessionStartTime}
        </Text>
    </View>
    <View style={styles.unitCountContainer}>
        <Text style={[ styles.unitCountText,
          {color: sessionColor}
        ]}>
          {totalUnits}
        </Text>
        {/* <SessionUnitsInputWindow
          currentUnits={totalUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setOtherUnits}
          styles={styles}
        /> */}
    </View>
    <ScrollView style={styles.scrollView}>
      {monkeMode ?
      <View style={styles.modifyUnitsContainer}>
        <TouchableOpacity
            style={[styles.modifyUnitsButton, {backgroundColor: 'red'}]}
            onPress={() => addOtherUnit(-1)}
        >
          <Text style={styles.modifyUnitsText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.modifyUnitsButton, {backgroundColor: 'green'}]}
            onPress={() => addOtherUnit(1)}
        >
          <Text style={styles.modifyUnitsText}>+</Text>
        </TouchableOpacity>
      </View>
      :
      <View style={styles.unitTypesContainer}>
        <DrinkingSessionUnitWindow
          unitName='Beer'
          iconSource={require('../assets/icons/beer.png')}
          currentUnits={beerUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setBeerUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Wine'
          iconSource={require('../assets/icons/wine.png')}
          currentUnits={wineUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setWineUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Weak Shot'
          iconSource={require('../assets/icons/weak_shot.png')}
          currentUnits={weakShotUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setWeakShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Strong Shot'
          iconSource={require('../assets/icons/strong_shot.png')}
          currentUnits={strongShotUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setStrongShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Cocktail'
          iconSource={require('../assets/icons/cocktail.png')}
          currentUnits={cocktailUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setCocktailUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Other'
          iconSource={require('../assets/icons/alcohol_assortment.png')}
          currentUnits={otherUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setOtherUnits}
        />
      </View>
      }
    </ScrollView>
    {/* <View style={styles.monkeModeContainer}>
    </View> */}
    <View style={styles.saveSessionContainer}>
      <BasicButton 
        text='Discard Session'
        buttonStyle={styles.saveSessionButton}
        textStyle={styles.saveSessionButtonText}
        onPress={() => setDiscardModalVisible(true)}
      />
      <YesNoPopup
        visible={discardModalVisible}
        transparent={true}
        onRequestClose={() => setDiscardModalVisible(false)}
        message={"Do you really want to\ndiscard this session?"}
        onYes={handleConfirmDiscard}
      />
      <BasicButton 
        text='Save Session'
        buttonStyle={styles.saveSessionButton}
        textStyle={styles.saveSessionButtonText}
        onPress={() => finishSession(db, user.uid)}
      />
    </View>
    </>
  );
};

export default DrinkingSessionScreen;


const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  backArrowContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  sessionInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    color: "black",
    alignSelf: "center",
    alignContent: "center",
    padding: 5,
  },
  sessionInfoContainer: {
    backgroundColor: '#FFFF99',
  },
  unitCountContainer: {
    height: '18%',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
    marginBottom: '-15%',
  },
  unitCountText: {
    fontSize: 90,
    fontWeight: "bold",
    // marginTop: 5,
    marginBottom: 10,
    alignSelf: "center",
    alignContent: "center",
    padding: 2,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 9,
  },
  scrollView: {
    flexGrow:1, 
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  unitTypesContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
  },
  unitsInputContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  unitsInputButton: {
    width: '40%',
    alignItems: 'center',
  },
  unitsInputText: {
    fontSize: 90,
    fontWeight: "bold",
    // marginTop: 5,
    marginBottom: 10,
    alignSelf: "center",
    alignContent: "center",
    padding: 2,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 9,
  },
  modifyUnitsContainer: {
    height: 400,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: "space-evenly",
    alignItems: 'center',
    flexDirection: "row",
    padding: 10,
  },
  modifyUnitsButton: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: 'center',
    borderRadius: 50,
  },
  modifyUnitsText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  monkeModeContainer: {
    height: '10%',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#FFFF99',
  },
  monkeModeButton: {
    width: '50%',
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fcf50f',
  },
  monkeModeButtonEnabled: {
    backgroundColor: '#FFFF99',
  },
  monkeModeButtonText: {
    color: 'black',
    fontSize: 17,
    fontWeight: '600',
  },
  saveSessionContainer: {
    height: '8%',
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: '#FFFF99',
    marginBottom: 2,
  },
  saveSessionButton: {
    width: '50%',
    height: '100%',
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: '#fcf50f',
    borderWidth: 1,
    borderColor: '#000',
  },
  saveSessionButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});