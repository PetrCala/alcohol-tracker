import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import { 
    timestampToDate, 
    formatDateToDay, 
    formatDateToTime, 
    changeDateBySomeDays, 
    unitsToColors,
    getSingleDayDrinkingSessions,
    setDateToCurrentTime,
    sumAllUnits,
    getZeroUnitsObject
} from '../utils/dataHandling';
import { useContext } from 'react';
import DatabaseContext from '../context/DatabaseContext';
import LoadingData from '../components/LoadingData';
import { DrinkingSessionProps, DrinkingSessionData, DrinkingSessionArrayItem } from '../types/database';
import { DayOverviewScreenProps } from '../types/screens';
import { getAuth } from 'firebase/auth';
import UserOffline from '../components/UserOffline';
import { useUserConnection } from '../context/UserConnectionContext';

type CombinedDataProps = {
  sessionKey: string,
  session: DrinkingSessionArrayItem
}

const DayOverviewScreen = ({ route, navigation }: DayOverviewScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { 
      dateObject, 
      drinkingSessionData, 
      drinkingSessionKeys,
      preferences 
    } = route.params; // Params for navigation
    const auth = getAuth();
    const user = auth.currentUser;
    const db = useContext(DatabaseContext);
    const { isOnline } = useUserConnection();
    const [ date, setDate ] = useState<Date>(timestampToDate(dateObject.timestamp));
    const [ dailySessionData, setDailyData ] = useState<DrinkingSessionArrayItem[]>(getSingleDayDrinkingSessions(date, drinkingSessionData));
    // Create a combined data object
    // const combinedData:CombinedDataProps[] = drinkingSessionData.map((session, index) => {
    //   return {
    //     sessionKey: drinkingSessionKeys[index], // Assign explicitly
    //     session
    //   };
    // });

    // Automatically navigate to login screen if login expires
    if (user == null){
        navigation.replace("Login Screen");
        return null;
    }

    const getDailyKeys = () => {
      let desiredIndexes:number[] = [];
      for (let i = 0; i < drinkingSessionData.length; i++) {
        if (dailySessionData.includes(drinkingSessionData[i])) {
          desiredIndexes.push(i);
        };
      };
      let dailyKeys = desiredIndexes.map(index => drinkingSessionKeys[index]);
      return dailyKeys;
    };
    
    const [ dailyKeys, setDailyKeys ] = useState<string[]>(getDailyKeys());
    
    const onSessionButtonPress = (session:DrinkingSessionArrayItem) => {
        navigation.navigate('Session Summary Screen', {
          session: session,
          preferences: preferences
        });
    };

    const onEditSessionPress = (sessionKey:string, session:DrinkingSessionArrayItem) => {
        navigation.navigate('Edit Session Screen', {
          session: session,
          sessionKey: sessionKey,
          preferences: preferences
        });
    };


    const DrinkingSession = ({sessionKey, session}: DrinkingSessionProps) => {
        // Calculate the session color
        var totalUnits = sumAllUnits(session.units)
        var unitsToColorsInfo = preferences.units_to_colors;
        var sessionColor = unitsToColors(totalUnits, unitsToColorsInfo);
        // Convert the timestamp to a Date object
        const date = timestampToDate(session.start_time);
        const viewStyle = {
            ...styles.menuDrinkingSessionContainer,
            backgroundColor: sessionColor
        }

        return (
        <View style={viewStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={styles.menuDrinkingSessionButton}
                    onPress={() => onSessionButtonPress(session)}
                  >
                    <Text style={styles.menuDrinkingSessionText}>Time: {formatDateToTime(date)}</Text>
                    <Text style={styles.menuDrinkingSessionText}>Units consumed: {totalUnits}</Text>
                  </TouchableOpacity>
                </View>
                <MenuIcon
                    iconId='edit-session-icon'
                    iconSource={require('../assets/icons/edit.png')}
                    containerStyle={styles.menuIconContainer}
                    iconStyle={styles.menuIcon}
                    onPress={() => onEditSessionPress(sessionKey, session)} // Use keyextractor to load id here
                />
            </View>
        </View>
        );
    };

    const renderDrinkingSession = ( {item} : {item: CombinedDataProps}) => {
        return(
            <DrinkingSession
              sessionKey = {item.sessionKey}
              session = {item.session}
            />
        );
    };

    const noDrinkingSessionsComponent = () => {
        return (
            <Text style={styles.menuDrinkingSessionInfoText}>No drinking sessions</Text>
        );
    }

    const addSessionButton = () => {
        if (date == null) {
            return(
                <LoadingData
                    // loadingText='Loading date data...'
                />
            )
        }
        // No button if the date is in the future
        let today = new Date();
        let tomorrowMidnight = changeDateBySomeDays(today, 1);
        tomorrowMidnight.setHours(0,0,0,0);
        if (date >= tomorrowMidnight){
            return(<></>);
        };
        // Create a new mock drinking session
        let newTimestamp = setDateToCurrentTime(date).getTime(); // At noon
        let newSession: DrinkingSessionArrayItem = {
          start_time: newTimestamp, // Arbitrary timestamp of today's noon
          end_time: newTimestamp + 1,
          units: getZeroUnitsObject(),
        }
        return(
            <TouchableOpacity
                style={styles.addSessionButton}
                onPress={() => navigation.navigate('Edit Session Screen',
                    {
                    session: newSession,
                    sessionKey: 'edit-session-id',
                    preferences: preferences
                  }
                )}
                >
                <Text style={styles.addSessionText}>+</Text>
            </TouchableOpacity>
        );
    }

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

    if (!isOnline) return (<UserOffline/>);

    // Loading drinking session data
    if ( date == null ) {
        return (
            <LoadingData
                // loadingText='Loading drinking session data...'
            />
        );
    };

    console.log(dailyKeys);
    return (
      <View style={{flex:1, backgroundColor: '#FFFF99'}}>
        <View style={styles.mainHeader}>
            <MenuIcon
            iconId='escape-settings-screen'
            iconSource={require('../assets/icons/arrow_back.png')}
            containerStyle={styles.backArrowContainer}
            iconStyle={styles.backArrow}
            onPress={() => navigation.goBack() }
            />
        </View>
        <View style={styles.dayOverviewContainer}>
            <Text style={styles.menuDrinkingSessionInfoText}>
                {date ? formatDateToDay(date) : "Loading date..."}
            </Text>
            {drinkingSessionData ?
            <FlatList
                data = {combinedData}
                renderItem={renderDrinkingSession}
                keyExtractor={item => String(item.sessionKey)} // Use start time as id
                ListEmptyComponent={noDrinkingSessionsComponent}
                ListFooterComponent={addSessionButton}
                ListFooterComponentStyle={styles.addSessionButtonContainer}
            />
            :
            <></>
            }
        </View>
        <View style={styles.dayOverviewFooter}>
            <MenuIcon
                iconId = "navigate-day-back"
                iconSource = {require('../assets/icons/arrow_back.png')}
                containerStyle={styles.previousDayContainer}
                iconStyle = {styles.nextDayArrow}
                onPress={() => {changeDay(-1)}}
            />
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


const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  menuDrinkingSessionContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 25,
    height: 25,
    padding: 10,
  },
  dayOverviewContainer: {
    flex: 1,
    overflow:"hidden"
  },
  menuDrinkingSessionButton: {
    flexGrow: 1,
    flexShrink: 1,
  },
  menuDrinkingSessionText: {
    fontSize: 16,
    color: 'black',
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
  dayOverviewFooter: {
    flexShrink: 1, // Only as large as necessary
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFF99',
    shadowColor: '#000',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderRadius: 2,
    marginVertical: 0,
    borderColor: '#ddd',
    elevation: 8, // for Android shadow
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addSessionButton: {
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center', // Center the text within the button
  },
  addSessionText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addSessionButtonContainer: {
    padding: 10,
    alignSelf: 'center',
  },
  previousDayContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nextDayContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    transform: [{rotate: '180deg'}]
  },
  nextDayArrow: {
    width: 25,
    height: 25,
    tintColor: "#1c73e6"
  },
});