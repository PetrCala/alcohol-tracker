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
import { DrinkingSessionData } from '../types/database';
import DatabaseContext from '../database/DatabaseContext';
import { removeDrinkingSessionData, editDrinkingSessionData } from '../database/drinkingSessions';
import SessionUnitsInputWindow from '../components/Buttons/SessionUnitsInputWindow';
import { formatDateToDay, formatDateToTime, timestampToDate } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';


const EditSessionScreen = ({ route, navigation}: EditSessionScreenProps) => {
    const { session } = route.params; 
    const auth = getAuth();
    const user = auth.currentUser;
    const [units, setUnits] = useState(session.units);
    const [timestamp, setTimestamp] = useState(session.timestamp); // Later editable
    const sessionId = session.session_id;
    const sessionDate = timestampToDate(timestamp);
    const sessionDay = formatDateToDay(sessionDate);
    const sessionTime = formatDateToTime(sessionDate);
    const db = useContext(DatabaseContext);


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

    async function saveSession(db: any, userId: string) {
        if (units > 0){
            // Create the session object to be saved
            const newSession: DrinkingSessionData = {
                session_id: sessionId,
                timestamp: timestamp,
                units: units
            };
            // Save the data into the database
            try {
                await editDrinkingSessionData(db, userId, newSession); // Save drinking session data
            } catch (error:any) {
                throw new Error('Failed to save drinking session data: ' + error.message);
            }
            navigation.navigate('Main Screen'); // Get the main overview, not day
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
        navigation.navigate('Main Screen'); // Get the main overview, not day
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