import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  processColor
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';
import { 
    timestampToDate, 
    formatDateToDay, 
    formatDateToTime, 
    fetchDrinkingSessions, 
    getSingleDayDrinkingSessions, 
    changeDateBySomeDays, 
    unitsToColors
} from '../utils/dataHandling';
import { useContext } from 'react';
import DatabaseContext from '../DatabaseContext';
import { DayOverviewScreenProps, DrinkingSessionProps, DrinkingSessionData, DrinkingSessionIds } from '../utils/types';
import { listenForDataChanges } from '../database';


const DayOverviewScreen = ({ route, navigation }: DayOverviewScreenProps) => {
    const { timestamp } = route.params; // Params for navigation
    const db = useContext(DatabaseContext);
    const [ date, setDate ] = useState<Date | null>(timestampToDate(timestamp));
    const [drinkingSessionIds, setDrinkingsessionIds] = useState<DrinkingSessionIds | null>(null); // Ids
    const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | null>([]); // Data

    const userId = 'petr_cala';

    const DrinkingSession = ({session, sessionColor}: DrinkingSessionProps) => {
        // Convert the timestamp to a Date object
        const date = timestampToDate(session.timestamp);
        const viewStyle = {
            ...styles.menuDrinkingSessionContainer,
            backgroundColor: sessionColor
        }

        return (
        <View style={viewStyle}>
            <Text style={styles.menuDrinkingSessionText}>Time: {formatDateToTime(date)}</Text>
            <Text style={styles.menuDrinkingSessionText}>Units consumed: {session.units}</Text>
        </View>
        );
    };

    const renderDrinkingSession = ( {item} : {item: DrinkingSessionData}) => {
        const sessionColor = unitsToColors(item.units);
         
        return(
            <DrinkingSession
            session = {item}
            sessionColor = {sessionColor}
            />
        );
    };

    const loadSingleDayDrinkingSessions = async(db: any, day: Date, sessionIds:any) => {
        try {
            let allDrinkingSessions = await fetchDrinkingSessions(db, sessionIds);
            let singleDayDrinkingSessions = getSingleDayDrinkingSessions(day, allDrinkingSessions);
            setDrinkingsessionData(singleDayDrinkingSessions);
        } catch (error:any){
            throw new Error("Failed to retrieve the drinking session data.");
        };
    };

    const changeDay = (days:number) => {
        if (date != null){
            const newDate = changeDateBySomeDays(date, days)
            setDate(newDate);
        };
    }

    // Monitor the date
    useEffect(() => {
        setDate(timestampToDate(timestamp));
    }, [timestamp]);

    // Monitor and update drinking session id data
    useEffect(() => {
        const refString = `user_drinking_sessions/${userId}`
        const stopListening = listenForDataChanges(db, refString, (ids:any) => {
        setDrinkingsessionIds(ids);
        });
        return () => {
        stopListening();
        };
    }, [db, userId]);


    // Monitor and update drinking session data
    useEffect(() => {
    if (drinkingSessionIds != null && date != null){
            loadSingleDayDrinkingSessions(db, date, drinkingSessionIds);
        } else {
            setDrinkingsessionData([]); // No data remaining
        }
    }, [date, drinkingSessionIds]); 


    // Loading drinking session data
    if (drinkingSessionData == null) {
        return (
        <View style={styles.container}>
            <Text>Loading data...</Text>
            <ActivityIndicator 
            size="large"
            color = "#0000ff"
            />
        </View>
        );
    };

    return (
        <View style={{flex:1, backgroundColor: '#FFFF99'}}>
        <View style={styles.header}>
            <MenuIcon
            iconId='escape-settings-screen'
            iconSource={require('../assets/icons/arrow_back.png')}
            containerStyle={styles.backArrowContainer}
            iconStyle={styles.backArrow}
            onPress={() => navigation.goBack() }
            />
        </View>
        <View>
            <Text style={styles.menuDrinkingSessionInfoText}>
                {date ? formatDateToDay(date) : "Loading date..."}
            </Text>
            <MenuIcon
                iconId = "navigate-day-back"
                iconSource = {require('../assets/icons/arrow_back.png')}
                containerStyle={styles.previousDayContainer}
                iconStyle = {styles.nextDayArrow}
                onPress={() => {changeDay(-1)}}
            />
            {drinkingSessionData ?
            <FlatList
                data = {drinkingSessionData}
                renderItem={renderDrinkingSession}
                keyExtractor={item => item.session_id}
            />
            :
            <Text style={styles.menuDrinkingSessionInfoText}>No drinking sessions found</Text>
            }
            <MenuIcon
                iconId = "navigate-day-forward"
                iconSource = {require('../assets/icons/arrow_back.png')}
                containerStyle={styles.nextDayContainer}
                iconStyle = {styles.nextDayArrow}
                onPress={() => {changeDay(1)}} 
            />
        </View>
        </View>
    );
};

export default DayOverviewScreen;
