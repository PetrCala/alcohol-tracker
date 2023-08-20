import React, {
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


const EditSessionScreen = ({ route, navigation}: EditSessionScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { session } = route.params; 
    const auth = getAuth();
    const user = auth.currentUser;
    // Units
    const [totalUnits, setTotalUnits] = useState<number>(sumAllUnits(session.units));
    const [beerUnits, setBeerUnits] = useState(session.units.beer)
    const [cocktailUnits, setCocktailUnits] = useState(session.units.cocktail)
    const [otherUnits, setOtherUnits] = useState(session.units.other)
    const [strongShotUnits, setStrongShotUnits] = useState(session.units.strong_shot)
    const [weakShotUnits, setWeakShotUnits] = useState(session.units.weak_shot)
    const [wineUnits, setWineUnits] = useState(session.units.wine)
    // Time info
    const [timestamp, setTimestamp] = useState(session.start_time); // Later editable
    const sessionId = session.session_id;
    const sessionDate = timestampToDate(timestamp);
    const sessionDay = formatDateToDay(sessionDate);
    const sessionStartTime = formatDateToTime(sessionDate);
    const db = useContext(DatabaseContext);


    // Automatically navigate to login screen if login expires
    if (user == null){
        navigation.replace("Login Screen");
        return null;
    }

    // Change local hook value
    const changeUnits = (number: number) => {
        const newUnits = totalUnits + number;
        if (newUnits >= 0 && newUnits < 100){
            setOtherUnits(newUnits);
            setTotalUnits(newUnits);
        }
    };

    async function saveSession(db: any, userId: string) {
        if (totalUnits > 0){
            let unitsToSave:UnitTypesProps = {
                beer: beerUnits,
                cocktail: cocktailUnits,
                other: otherUnits,
                strong_shot: strongShotUnits,
                weak_shot: weakShotUnits,
                wine: wineUnits,
              }
              let newSession: DrinkingSessionData = {
                end_time: session.end_time,
                last_unit_added_time: session.last_unit_added_time,
                session_id: sessionId,
                start_time: session.start_time,
                units: unitsToSave
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
        <View>
            <Text style={styles.menuDrinkingSessionInfoText}>
                {sessionDay}
            </Text>
            <Text style={styles.menuDrinkingSessionInfoText}>
                {sessionStartTime}
            </Text>
        </View>
        <View style={styles.drinkingSessionContainer}>
            <SessionUnitsInputWindow
            currentUnits={totalUnits}
            onUnitsChange={setTotalUnits}
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
            onPress={() => saveSession(db, user.uid)}
            />
            <BasicButton 
            text='Delete Session'
            buttonStyle={styles.drinkingSessionButton}
            textStyle={styles.drinkingSessionButtonText}
            onPress={() => deleteSession(db, user.uid, sessionId)}
            />
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