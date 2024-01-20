import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import commonStyles from '../styles/commonStyles';

import UploadImageComponent from '../components/UploadImage';
import {useFirebase} from '../context/FirebaseContext';
import PermissionHandler from '../permissions/PermissionHandler';
import {ProfileProps} from '@src/types/screens';
import ProfileImage from '@components/ProfileImage';
import {StatData, StatsOverview} from '@components/Items/StatOverview';
import ProfileOverview from '@components/Social/ProfileOverview';
import {useEffect, useMemo, useReducer} from 'react';
import {readDataOnce} from '@database/baseFunctions';
import {
  DrinkingSessionArrayItem,
  PreferencesData,
} from '@src/types/database';
import {
  calculateThisMonthPoints,
  calculateThisMonthUnits,
  dateToDateObject,
  getSingleMonthDrinkingSessions,
  timestampToDate,
} from '@src/utils/dataHandling';
import {DateObject} from '@src/types/components';
import SessionsCalendar from '@components/Calendar';
import LoadingData from '@components/LoadingData';

interface State {
  isLoading: boolean;
  preferences: PreferencesData | null;
  drinkingSessionData: DrinkingSessionArrayItem[] | null;
  visibleDateObject: DateObject;
  drinkingSessionsCount: number;
  unitsConsumed: number;
  pointsEarned: number;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  isLoading: true,
  preferences: null,
  drinkingSessionData: null,
  visibleDateObject: dateToDateObject(new Date()),
  drinkingSessionsCount: 0,
  unitsConsumed: 0,
  pointsEarned: 0,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, isLoading: action.payload};
    case 'SET_PREFERENCES':
      return {...state, preferences: action.payload};
    case 'SET_DRINKING_SESSION_DATA':
      return {...state, drinkingSessionData: action.payload};
    case 'SET_VISIBLE_DATE_OBJECT':
      return {...state, visibleDateObject: action.payload};
    case 'SET_DRINKING_SESSIONS_COUNT':
      return {...state, drinkingSessionsCount: action.payload};
    case 'SET_UNITS_CONSUMED':
      return {...state, unitsConsumed: action.payload};
    case 'SET_POINTS_EARNED':
      return {...state, pointsEarned: action.payload};
    default:
      return state;
  }
};

const ProfileScreen = ({route, navigation}: ProfileProps) => {
  if (!route || !navigation) return null;
  const {userId, profileData, drinkingSessionData, preferences} = route.params;
  const {db, storage} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Define your stats data
  const statsData: StatData = [
    {header: 'Drinking Sessions', content: String(state.drinkingSessionsCount)},
    {header: 'Units Consumed', content: String(state.unitsConsumed)},
    {header: 'Points Earned', content: String(state.pointsEarned)},
  ];

  // Database data hooks
  useEffect(() => {
    const fetchData = async () => {
      dispatch({type: 'SET_LOADING', payload: true});

      try {
        let userSessions: DrinkingSessionArrayItem[] | null =
          drinkingSessionData;
        let userPreferences: PreferencesData | null = preferences;

        if (!userSessions) {
          const newSessions = await readDataOnce(
            db,
            `user_drinking_sessions/${userId}`,
          );
          userSessions = Object.values(newSessions);
        }
        if (!userPreferences) {
          userPreferences = await readDataOnce(
            db,
            `user_preferences/${userId}`,
          );
        }

        dispatch({type: 'SET_DRINKING_SESSION_DATA', payload: userSessions});
        dispatch({type: 'SET_PREFERENCES', payload: userPreferences});
      } catch (error: any) {
        Alert.alert(
          'Error fetching data',
          `Could not connect to the database: ${error.message}`,
        );
      }

      dispatch({type: 'SET_LOADING', payload: false});
    };

    fetchData();
  }, [userId, drinkingSessionData, preferences]);

  useMemo(() => {
    if (!drinkingSessionData || !preferences) return;

    let thisMonthUnits = calculateThisMonthUnits(
      state.visibleDateObject,
      drinkingSessionData,
    );
    let thisMonthPoints = calculateThisMonthPoints(
      state.visibleDateObject,
      drinkingSessionData,
      preferences.units_to_points,
    );
    let thisMonthSessionCount = getSingleMonthDrinkingSessions(
      timestampToDate(state.visibleDateObject.timestamp),
      drinkingSessionData,
      false,
    ).length; // Replace this in the future

    dispatch({
      type: 'SET_DRINKING_SESSIONS_COUNT',
      payload: thisMonthSessionCount,
    });
    dispatch({type: 'SET_UNITS_CONSUMED', payload: thisMonthUnits});
    dispatch({type: 'SET_POINTS_EARNED', payload: thisMonthPoints});
  }, [state.drinkingSessionData, state.visibleDateObject]);

  if (state.isLoading) return <LoadingData />;
  if (!db || !storage || !preferences || !drinkingSessionData) return;

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId="escape-profile-screen"
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.menuContainer}>
          <Text style={styles.sectionText}>Profile</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <ProfileOverview userId={userId} profileData={profileData} />
        <View style={styles.horizontalLine} />
        <View style={styles.statsOverviewHolder}>
          <StatsOverview statsData={statsData} />
        </View>
        <SessionsCalendar
          drinkingSessionData={drinkingSessionData}
          preferences={preferences}
          visibleDateObject={state.visibleDateObject}
          dispatch={dispatch}
          onDayPress={(day: DateObject) => {}}
        />
        <View style={{height: 200, backgroundColor: '#ffff99'}}></View>
      </ScrollView>
    </View>
  );
};

{
  /* <PermissionHandler permissionType="write_photos">
  <UploadImageComponent storage={storage} />
</PermissionHandler> */
}

export default ProfileScreen;

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  backArrowContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 200,
  },
  sectionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  horizontalLine: {
    width: screenWidth * 0.9,
    height: 1,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginTop: 5,
  },
  statsOverviewHolder: {
    height: 120,
    flexDirection: 'row',
    width: screenWidth,
  },
});
