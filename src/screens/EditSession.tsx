import React, {
useRef,
useState,
useContext,
useEffect
} from 'react';
import {
Text,
View,
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { EditSessionScreenProps, DrinkingSessionData } from '../utils/types';
import DatabaseContext from '../DatabaseContext';
import { saveDrinkingSessionData, removeDrinkingSessionData } from '../database';
import ClickableTextInput from '../components/Buttons/ClickableTextInput';
import { formatDateToDay, formatDateToTime, timestampToDate } from '../utils/dataHandling';


const EditSessionScreen = ({ route, navigation}: EditSessionScreenProps) => {
    const { session } = route.params; 
    const [units, setUnits] = useState(session.units);
    const [timestamp, setTimestamp] = useState(session.timestamp); // Later editable
    const sessionDate = timestampToDate(timestamp);
    const sessionDay = formatDateToDay(sessionDate);
    const sessionTime = formatDateToTime(sessionDate);
    const db = useContext(DatabaseContext);
    const userId = 'petr_cala';


    // Change local hook value
    const changeUnits = (number: number) => {
        const newUnits = units + number;
        if (newUnits >= 0){
            setUnits(newUnits);
        }
    };


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
            onPress={() => saveSession(db, userId, units, timestamp)}
            />
            <BasicButton 
            text='Delete Session'
            buttonStyle={styles.drinkingSessionButton}
            textStyle={styles.drinkingSessionButtonText}
            onPress={() => deleteSession(db, userId, session.session_id)}
            />
        </View>
        </View>
    );
};

export default EditSessionScreen;
