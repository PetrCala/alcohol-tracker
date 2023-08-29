import React, {
    useEffect,
    useState,
    useContext,
} from 'react';
import {
    StyleSheet,
Text,
View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { EditSessionScreenProps} from '../types/screens';
import { DrinkingSessionData, UnitTypesProps } from '../types/database';
import DatabaseContext from '../database/DatabaseContext';
import { removeDrinkingSessionData, editDrinkingSessionData } from '../database/drinkingSessions';
import SessionUnitsInputWindow from '../components/Buttons/SessionUnitsInputWindow';
import { formatDateToDay, formatDateToTime, sumAllUnits, timestampToDate } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';
import DrinkingSessionUnitWindow from '../components/DrinkingSessionUnitWindow';


const EditSessionScreen = ({ route, navigation}: EditSessionScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { session } = route.params; 
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
        <View style={{flex:1, backgroundColor: '#FFFF99'}}>
        <View style={styles.mainHeader}>
            <MenuIcon
            iconId='escape-edit-session'
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
      <SessionUnitsInputWindow
        currentUnits={totalUnits}
        setCurrentUnits={setTotalUnits}
        styles={styles}
      />
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
      <View style={styles.otherButtonsContainer}>
        <View style={{padding: 5}}>
        <BasicButton 
          text='Add Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => addOtherUnit(1)}
        />
        <BasicButton 
          text='Remove Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => addOtherUnit(-1)}
        />
        </View>
        <View style={{padding: 5}}>
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
          onPress={() => deleteSession(db, user.uid, session_id)}
        />
        </View>
      </View>
    </View>
    );
};

export default EditSessionScreen;

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
  unitsInputContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  unitsInputButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 15,
    width: 300,
    alignItems: 'center',
    borderColor: '#212421',
    backgroundColor: 'white',
  },
  unitsInputText: {
      fontSize: 18,
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#212421',
      alignContent: 'center',
  },
  sessionInfoContainer: {

  },
  unitTypesContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  otherButtonsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: 2,
  },
});