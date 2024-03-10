import {ScrollView, StyleSheet, Text, View} from 'react-native';
import MenuIcon from '@components/Buttons/MenuIcon';
import {
  formatDate,
  formatDateToDay,
  formatDateToTime,
  getLastUnitAddedTime,
  sumAllPoints,
  sumAllUnits,
  sumUnitsOfSingleType,
  timestampToDate,
  unitsToColors,
} from '@libs/DataHandling';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';
import BasicButton from '@components/Buttons/BasicButton';
import MainHeader from '@components/Header/MainHeader';
import CONST from '@src/CONST';
import {DrinkingSession} from '@src/types/database';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {StackScreenProps} from '@react-navigation/stack';
import SCREENS from '@src/SCREENS';
import {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import {useState} from 'react';
import {extractSessionOrEmpty} from '@libs/SessionUtils';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const SessionDataItem = ({
  heading,
  data,
  index,
  sessionColor,
}: {
  heading: string;
  data: any;
  index: number;
  sessionColor?: string; // Optional property for sessionColor
}) => (
  <View
    style={[
      styles.sessionDataContainer,
      {backgroundColor: index % 2 === 0 ? '#FFFFbd' : 'white'},
    ]}>
    <Text style={styles.sessionDataHeading}>{heading}</Text>
    {sessionColor ? (
      // Render the colored rectangle when sessionColor is present
      <View
        style={[styles.sessionColorMarker, {backgroundColor: sessionColor}]}
      />
    ) : (
      // Else render the text
      <Text style={styles.sessionDataText}>{data}</Text>
    )}
  </View>
);

type SessionSummaryScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SUMMARY
>;

const SessionSummaryScreen = ({
  route,
  navigation,
}: SessionSummaryScreenProps) => {
  const {sessionId} = route.params;
  const {preferences, drinkingSessionData} = useDatabaseData();
  if (!preferences) return null; // Careful when writing hooks after this line
  const [session, setSession] = useState<DrinkingSession>(
    extractSessionOrEmpty(sessionId, drinkingSessionData),
  );
  // Units info
  const totalUnits = sumAllUnits(session.units);
  const totalPoints = sumAllPoints(session.units, preferences.units_to_points);
  const unitSums = {
    small_beer: sumUnitsOfSingleType(session.units, 'small_beer'),
    beer: sumUnitsOfSingleType(session.units, 'beer'),
    wine: sumUnitsOfSingleType(session.units, 'wine'),
    weak_shot: sumUnitsOfSingleType(session.units, 'weak_shot'),
    strong_shot: sumUnitsOfSingleType(session.units, 'strong_shot'),
    cocktail: sumUnitsOfSingleType(session.units, 'cocktail'),
    other: sumUnitsOfSingleType(session.units, 'other'),
  };
  // Time info
  const sessionStartDate = timestampToDate(session.start_time);
  const sessionEndDate = timestampToDate(session.end_time);
  const sessionDay = formatDateToDay(sessionStartDate);
  const sessionStartTime = formatDateToTime(sessionStartDate);
  const sessionEndTime = formatDateToTime(sessionEndDate);
  // Figure out last unit added
  let lastUnitAdded: string;
  const lastUnitEditTimestamp = getLastUnitAddedTime(session);
  if (!lastUnitEditTimestamp) {
    lastUnitAdded = 'Unknown';
  } else {
    const lastUnitAddedDate = timestampToDate(lastUnitEditTimestamp);
    lastUnitAdded = formatDateToTime(lastUnitAddedDate);
  }

  const onEditSessionPress = (sessionId: string) => {
    Navigation.navigate(ROUTES.DRINKING_SESSION_EDIT.getRoute(sessionId));
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const generalData = [
    {heading: 'Points:', data: totalPoints.toString()},
    {heading: 'Date:', data: sessionDay},
    {heading: 'Start time:', data: sessionStartTime},
    {heading: 'Last unit added:', data: lastUnitAdded},
    {heading: 'End time:', data: sessionEndTime},
  ];

  const unitData = [
    {heading: 'Units:', data: totalUnits.toString()},
    {heading: 'Small Beer:', data: unitSums.small_beer.toString()},
    {heading: 'Beer:', data: unitSums.beer.toString()},
    {heading: 'Wine:', data: unitSums.wine.toString()},
    {heading: 'Weak Shot:', data: unitSums.weak_shot.toString()},
    {heading: 'Strong Shot:', data: unitSums.strong_shot.toString()},
    {heading: 'Cocktail:', data: unitSums.cocktail.toString()},
    {heading: 'Other:', data: unitSums.other.toString()},
  ];

  const otherData = [
    {heading: 'Blackout:', data: session.blackout ? 'Yes' : 'No'},
    {heading: 'Note:', data: session.note},
  ];

  let sessionColor = session.blackout
    ? 'black'
    : unitsToColors(totalUnits, preferences.units_to_colors);

  return (
    <>
      <MainHeader
        headerText=""
        onGoBack={handleBackPress}
        rightSideComponent={
          session.ongoing ? null : (
            <MenuIcon
              iconId="edit-session-icon"
              iconSource={KirokuIcons.Edit}
              containerStyle={styles.menuIconContainer}
              iconStyle={styles.menuIcon}
              onPress={() => onEditSessionPress(sessionId)} // Use keyextractor to load id here
            />
          )
        }
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.sessionInfoContainer}>
          <Text style={styles.sessionInfoText}>Session Summary</Text>
        </View>

        <View style={styles.sessionSectionContainer}>
          <Text style={styles.sessionDataContainerHeading}>General</Text>
          <SessionDataItem
            key="sessionColor"
            heading="Session Color"
            data={sessionColor}
            index={generalData.length}
            sessionColor={sessionColor}
          />
          {generalData.map((item, index) => (
            <SessionDataItem
              key={index}
              heading={item.heading}
              data={item.data}
              index={index}
            />
          ))}
        </View>

        <View style={styles.sessionSectionContainer}>
          <Text style={styles.sessionDataContainerHeading}>Units consumed</Text>
          {unitData.map((item, index) => (
            <SessionDataItem
              key={index}
              heading={item.heading}
              data={item.data}
              index={index}
            />
          ))}
        </View>

        <View style={styles.sessionSectionContainer}>
          <Text style={styles.sessionDataContainerHeading}>Other</Text>
          {otherData.map((item, index) => (
            <SessionDataItem
              key={index}
              heading={item.heading}
              data={item.data}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.confirmButtonContainer}>
        <BasicButton
          text="Confirm"
          buttonStyle={styles.confirmButton}
          textStyle={styles.confirmButtonText}
          onPress={() => navigation.goBack()}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuIcon: {
    width: 25,
    height: 25,
    padding: 10,
  },
  scrollView: {
    flexGrow: 1,
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
    fontWeight: 'bold',
    marginTop: 5,
    color: 'black',
    alignSelf: 'center',
    alignContent: 'center',
    padding: 10,
  },
  sessionSectionContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  sessionDataContainerHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4a4b4d',
    fontStyle: 'italic',
    alignSelf: 'center',
    padding: 10,
  },
  sessionDataContainer: {
    width: '100%',
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
    marginLeft: 10,
    overflow: 'hidden',
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
    height: '10%',
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFF99',
    marginBottom: 5,
    padding: 5,
  },
  confirmButton: {
    width: '50%',
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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

export default SessionSummaryScreen;
