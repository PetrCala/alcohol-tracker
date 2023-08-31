import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SessionSummaryScreenProps} from '../types/screens';
import { getAuth } from 'firebase/auth';
import MenuIcon from '../components/Buttons/MenuIcon';
import { formatDate, formatDateToDay, formatDateToTime, sumAllUnits, timestampToDate, unitsToColors } from '../utils/dataHandling';
import BasicButton from '../components/Buttons/BasicButton';

const SessionDataItem = ({
    heading,
    data,
    index,
    sessionColor
  }: {
    heading: string,
    data: string,
    index: number,
    sessionColor?: string // Optional property for sessionColor
  }) => (
    <View style={[styles.sessionDataContainer, { backgroundColor: index % 2 === 0 ? '#FFFFbd' : 'white' }]}>
      <Text style={styles.sessionDataHeading}>{heading}</Text>
      {sessionColor ? (
        // Render the colored rectangle when sessionColor is present
        <View style={[
            styles.sessionColorMarker,
            {backgroundColor: sessionColor}
        ]}/>
      ) : (
        // Else render the text
        <Text style={styles.sessionDataText}>{data}</Text>
      )}
    </View>
  );

const SessionSummaryScreen = ({ route, navigation}: SessionSummaryScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { session, preferences } = route.params; 
    const { end_time, last_unit_added_time, session_id, start_time, units } = session;
    // Units info
    const totalUnits = sumAllUnits(units);
    // Time info
    const sessionStartDate = timestampToDate(start_time);
    const lastUnitAddedDate = timestampToDate(last_unit_added_time);
    const sessionEndDate = timestampToDate(end_time);
    const sessionDay = formatDateToDay(sessionStartDate);
    const sessionStartTime = formatDateToTime(sessionStartDate);
    const lastUnitAddedTime = formatDateToTime(lastUnitAddedDate);
    const sessionEndTime = formatDateToTime(sessionEndDate);
    // Other
    const sessionColor = unitsToColors(totalUnits, preferences.units_to_colors);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const generalData = [
        { heading: 'Date:', data: sessionDay },
        { heading: 'Start time:', data: sessionStartTime },
        { heading: 'Last unit added:', data: lastUnitAddedTime },
        { heading: 'End time:', data: sessionEndTime },
      ];
    
      const unitData = [
        { heading: 'Total:', data: totalUnits.toString() },
        { heading: 'Beer:', data: units.beer.toString() },
        { heading: 'Wine:', data: units.wine.toString() },
        { heading: 'Weak Shot:', data: units.weak_shot.toString() },
        { heading: 'Strong Shot:', data: units.strong_shot.toString() },
        { heading: 'Cocktail:', data: units.cocktail.toString() },
        { heading: 'Other:', data: units.other.toString() },
      ];

    return (
        <>
          <View style={styles.mainHeader}>
            <MenuIcon
              iconId='escape-session-summary'
              iconSource={require('../assets/icons/arrow_back.png')}
              containerStyle={styles.backArrowContainer}
              iconStyle={styles.backArrow}
              onPress={handleBackPress}
            />
          </View>
          <ScrollView style={styles.scrollView}>
            <View style={styles.sessionInfoContainer}>
            <Text style={styles.sessionInfoText}>Session Summary</Text>
            </View>
            <View style={styles.sessionSectionContainer}>
            <Text style={styles.sessionDataContainerHeading}>General</Text>
            {generalData.map((item, index) => (
                <SessionDataItem key={index} heading={item.heading} data={item.data} index={index} />
            ))}
            <SessionDataItem key="sessionColor" heading="Session Color" data = {sessionColor} index={generalData.length} sessionColor={sessionColor} />
            </View>

            <View style={styles.sessionSectionContainer}>
            <Text style={styles.sessionDataContainerHeading}>Units consumed</Text>
            {unitData.map((item, index) => (
                <SessionDataItem key={index} heading={item.heading} data={item.data} index={index} />
            ))}
            </View>
            </ScrollView>
            <View style={styles.confirmButtonContainer}>
                <BasicButton 
                    text='Confirm'
                    buttonStyle={styles.confirmButton}
                    textStyle={styles.confirmButtonText}
                    onPress={() => navigation.goBack()}
                />
            </View>
        </>
    );
};

export default SessionSummaryScreen;

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
  scrollView: {
    flexGrow:1, 
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  sessionInfoContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  sessionInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    color: "black",
    alignSelf: "center",
    alignContent: "center",
    padding: 10,
  },
  sessionSectionContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  sessionDataContainerHeading: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4a4b4d",
    fontStyle: 'italic',
    alignSelf: 'center',
    padding: 10,
  },
  sessionDataContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderWidth: 1,
    // borderColor: 'grey',
    padding: 7,
  },
  sessionDataHeading: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  sessionDataText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '400',
    marginRight: 5,
  },
  sessionColorMarker: {
    width: 20, 
    height: 20, 
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 5,
    marginRight: 5,
  },
  confirmButtonContainer: {
    width: '100%',
    height: '8%',
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: '#FFFF99',
    marginBottom: 5,
    padding: 5,
  },
  confirmButton: {
    width: '50%',
    height: '100%',
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    marginBottom: 30,
    marginTop: 10,
    backgroundColor: '#fcf50f',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});