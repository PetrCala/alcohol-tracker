import React, {
    useEffect,
    useState,
    useContext,
} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { EditSessionScreenProps} from '../types/screens';
import { DrinkingSessionData, UnitTypesProps } from '../types/database';
import DatabaseContext from '../database/DatabaseContext';
import { removeDrinkingSessionData, editDrinkingSessionData } from '../database/drinkingSessions';
import SessionUnitsInputWindow from '../components/Buttons/SessionUnitsInputWindow';
import { formatDateToDay, formatDateToTime, sumAllUnits, timestampToDate, unitsToColors } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';
import DrinkingSessionUnitWindow from '../components/DrinkingSessionUnitWindow';


const EditSessionScreen = ({ route, navigation}: EditSessionScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { session, preferences } = route.params; 
    const { end_time, last_unit_added_time, session_id, start_time, units } = session;
    const auth = getAuth();
    const user = auth.currentUser;
    // Units
    const [totalUnits, setTotalUnits] = useState<number>(sumAllUnits(units));
    const [beerUnits, setBeerUnits] = useState(units.beer)
    const [cocktailUnits, setCocktailUnits] = useState(units.cocktail)
    const [otherUnits, setOtherUnits] = useState(units.other)
    const [strongShotUnits, setStrongShotUnits] = useState(units.strong_shot)
    const [weakShotUnits, setWeakShotUnits] = useState(units.weak_shot)
    const [wineUnits, setWineUnits] = useState(units.wine)
    const allUnits:UnitTypesProps = {
      beer: beerUnits,
      cocktail: cocktailUnits,
      other: otherUnits,
      strong_shot: strongShotUnits,
      weak_shot: weakShotUnits,
      wine: wineUnits,
    };
    // Time info
    const sessionDate = timestampToDate(start_time);
    const sessionDay = formatDateToDay(sessionDate);
    const sessionStartTime = formatDateToTime(sessionDate);
    const db = useContext(DatabaseContext);
      // Other
    const [monkeMode, setMonkeMode] = useState<boolean>(false);
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

    // Track total units
    useEffect(() => {
        let allUnitsSum = sumAllUnits(allUnits);
        setTotalUnits(allUnitsSum);
    }, [allUnits]);


    async function saveSession(db: any, userId: string) {
        if (totalUnits > 99){
            console.log('cannot save this session');
            return null;
          };
        if (totalUnits > 0){
              let newSession: DrinkingSessionData = {
                end_time: end_time,
                last_unit_added_time: last_unit_added_time,
                session_id: session_id,
                start_time: start_time,
                units: allUnits
              };
            // Save the data into the database
            try {
                await editDrinkingSessionData(db, userId, newSession); // Save drinking session data
            } catch (error:any) {
                throw new Error('Failed to save drinking session data: ' + error.message);
            }
            if (navigation){
                navigation.navigate('Main Screen'); // Get the main overview, not day
            } else {
                throw new Error('Navigation not found');
            }
        }
    };

    /** Discard the current session, reset current units and 
     * session status, and navigate to main menu.
     */
    async function deleteSession(db: any, userId: string, sessionId: string){
        try {
            await removeDrinkingSessionData(db, userId, sessionId); 
        } catch (error:any) {
            throw new Error('Failed to delete the session: ' + error.message);
        }
        if (navigation){
            navigation.navigate('Main Screen'); // Get the main overview, not day
        } else {
            throw new Error('Navigation not found');
        }
    }

    /** If an update is pending, update immediately before navigating away
     */
    const handleBackPress = async () => {
        navigation.goBack();
    };


    return (
      <>
      <View style={styles.mainHeader}>
          <MenuIcon
          iconId='escape-edit-session'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={handleBackPress}
          />
        <BasicButton 
          text='Monke Mode'
          buttonStyle={styles.monkeModeButton}
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
          setCurrentUnits={setBeerUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Wine'
          iconSource={require('../assets/icons/wine.png')}
          currentUnits={wineUnits}
          setCurrentUnits={setWineUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Weak Shot'
          iconSource={require('../assets/icons/weak_shot.png')}
          currentUnits={weakShotUnits}
          setCurrentUnits={setWeakShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Strong Shot'
          iconSource={require('../assets/icons/strong_shot.png')}
          currentUnits={strongShotUnits}
          setCurrentUnits={setStrongShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Cocktail'
          iconSource={require('../assets/icons/cocktail.png')}
          currentUnits={cocktailUnits}
          setCurrentUnits={setCocktailUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Other'
          iconSource={require('../assets/icons/alcohol_assortment.png')}
          currentUnits={otherUnits}
          setCurrentUnits={setOtherUnits}
        />
      </View>
      }
    </ScrollView>
    <View style={styles.saveSessionContainer}>
        <BasicButton 
          text='Delete Session'
          buttonStyle={styles.saveSessionButton}
          textStyle={styles.saveSessionButtonText}
          onPress={() => deleteSession(db, user.uid, session_id)}
        />
        <BasicButton 
          text='Save Session'
          buttonStyle={styles.saveSessionButton}
          textStyle={styles.saveSessionButtonText}
          onPress={() => saveSession(db, user.uid)}
        />
    </View>
    </>
    );
};

export default EditSessionScreen;

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
    width: '40%',
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    // marginBottom: 10,
    // marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  monkeModeButtonText: {
    color: 'white',
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
    borderColor: 'grey',
  },
  saveSessionButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});