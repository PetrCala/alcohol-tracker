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
    changeDateBySomeDays, 
    unitsToColors
} from '../utils/dataHandling';
import { useContext } from 'react';
import DatabaseContext from '../DatabaseContext';
import { DayOverviewScreenProps, DrinkingSessionProps, DrinkingSessionData, DrinkingSessionIds } from '../utils/types';
import { listenForAllSingleDaySessions, listenForDataChanges } from '../database';


const DayOverviewScreen = ({ route, navigation }: DayOverviewScreenProps) => {
    const { timestamp } = route.params; // Params for navigation
    const db = useContext(DatabaseContext);
    const [ date, setDate ] = useState<Date | null>(timestampToDate(timestamp));
    const [drinkingSessionData, setDrinkingsessionData] = useState<DrinkingSessionData[] | null>([]); // Data
    const [ loadingData, setLoadingData] = useState<boolean | null>(true);

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

    /** Offset the "date" hook by a number of days.
     * 
     * @param days Number of days to change the day by.
     */
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
        if (date != null){
            const stopListening = listenForAllSingleDaySessions(db, userId, date, (data:any) => {
                setDrinkingsessionData(data);
                setLoadingData(false);
            });
            return () => {
                stopListening();
            };
        }
    }, [db, userId, date]);


    // Loading drinking session data
    if ( date == null || loadingData) {
        return (
        <View style={styles.container}>
            <Text>Loading drinking session data...</Text>
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
