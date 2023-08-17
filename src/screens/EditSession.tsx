import React, {
useState,
useContext,
} from 'react';
import {
Text,
View,
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { EditSessionScreenProps} from '../types/screens';
import { DrinkingSessionData } from '../types/database';
import DatabaseContext from '../database/DatabaseContext';
import { removeDrinkingSessionData, editDrinkingSessionData } from '../database/drinkingSessions';
import ClickableTextInput from '../components/Buttons/ClickableTextInput';
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
        if (newUnits >= 0){
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
        navigation.goBack();
    }

    /** If an update is pending, update immediately before navigating away
     */
    const handleBackPress = async () => {
        navigation.goBack();
    };


    return (
        <View style={{flex:1, backgroundColor: '#FFFF99'}}>
        <View style={styles.header}>
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
            {/* <ClickableTextInput
                text = {sessionTime}
                currentUnits={units}
                onUnitsChange={setUnits}
            /> */}
            <Text style={styles.menuDrinkingSessionInfoText}>
                {sessionTime}
            </Text>
        </View>
        <View style={styles.drinkingSessionContainer}>
            <ClickableTextInput
            text = ''
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
