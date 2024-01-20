import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import commonStyles from '../styles/commonStyles';

import UploadImageComponent from '../components/UploadImage';
import {useFirebase} from '../context/FirebaseContext';
import PermissionHandler from '../permissions/PermissionHandler';
import {ProfileProps} from '@src/types/screens';
import {auth} from '../services/firebaseSetup';
import {StatData, StatsOverview} from '@components/Items/StatOverview';
import ProfileOverview from '@components/Social/ProfileOverview';
import {useEffect, useMemo, useReducer} from 'react';
import {readDataOnce} from '@database/baseFunctions';
import {DrinkingSessionArrayItem, PreferencesData} from '@src/types/database';
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
import ItemListPopup from '@components/Popups/ItemListPopup';
import {unfriend} from '@database/friends';
import YesNoPopup from '@components/Popups/YesNoPopup';

interface State {
  isLoading: boolean;
  preferences: PreferencesData | null;
  drinkingSessionData: DrinkingSessionArrayItem[] | null;
  visibleDateObject: DateObject;
  drinkingSessionsCount: number;
  unitsConsumed: number;
  pointsEarned: number;
  manageFriendModalVisible: boolean;
  unfriendModalVisible: boolean;
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
  manageFriendModalVisible: false,
  unfriendModalVisible: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_IS_LOADING':
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
    case 'SET_MANAGE_FRIEND_MODAL_VISIBLE':
      return {...state, manageFriendModalVisible: action.payload};
    case 'SET_UNFRIEND_MODAL_VISIBLE':
      return {...state, unfriendModalVisible: action.payload};
    default:
      return state;
  }
};

const ProfileScreen = ({route, navigation}: ProfileProps) => {
  if (!route || !navigation) return null;
  const user = auth.currentUser;
  const {userId, profileData, drinkingSessionData, preferences} = route.params;
  const {db, storage} = useFirebase();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleUnfriend = async () => {
    if (!user) return;
    try {
      await unfriend(db, user.uid, userId);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'User does not exist in the database',
        'Could not unfriend this user: ' + error.message,
      );
    } finally {
      dispatch({type: 'SET_UNFRIEND_MODAL_VISIBLE', payload: false});
      dispatch({type: 'SET_MANAGE_FRIEND_MODAL_VISIBLE', payload: false});
    }
  };

  const manageFriendData = [
    {
      label: 'Unfriend',
      icon: require('../../assets/icons/remove-user.png'),
      action: () =>
        dispatch({type: 'SET_UNFRIEND_MODAL_VISIBLE', payload: true}),
    },
  ];

  // Define your stats data
  const statsData: StatData = [
    {header: 'Drinking Sessions', content: String(state.drinkingSessionsCount)},
    {header: 'Units Consumed', content: String(state.unitsConsumed)},
    {header: 'Points Earned', content: String(state.pointsEarned)},
  ];

  // Database data hooks
  useEffect(() => {
    const fetchData = async () => {
      dispatch({type: 'SET_IS_LOADING', payload: true});

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

      dispatch({type: 'SET_IS_LOADING', payload: false});
    };

    fetchData();
  }, [userId, drinkingSessionData, preferences]);

  useMemo(() => {
    if (!state.drinkingSessionData || !state.preferences) return;

    let thisMonthUnits = calculateThisMonthUnits(
      state.visibleDateObject,
      state.drinkingSessionData,
    );
    let thisMonthPoints = calculateThisMonthPoints(
      state.visibleDateObject,
      state.drinkingSessionData,
      state.preferences.units_to_points,
    );
    let thisMonthSessionCount = getSingleMonthDrinkingSessions(
      timestampToDate(state.visibleDateObject.timestamp),
      state.drinkingSessionData,
      false,
    ).length; // Replace this in the future

    dispatch({
      type: 'SET_DRINKING_SESSIONS_COUNT',
      payload: thisMonthSessionCount,
    });
    dispatch({type: 'SET_UNITS_CONSUMED', payload: thisMonthUnits});
    dispatch({type: 'SET_POINTS_EARNED', payload: thisMonthPoints});
  }, [state.drinkingSessionData, state.preferences, state.visibleDateObject]);

  if (state.isLoading) return <LoadingData />;
  if (!db || !storage || !state.preferences || !state.drinkingSessionData)
    return;

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
          <Text style={styles.sectionText}>{user?.uid === userId ? "Profile" : "Friend Overview"}</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <ProfileOverview userId={userId} profileData={profileData} />
        <View style={styles.horizontalLine} />
        <View style={styles.statsOverviewHolder}>
          <StatsOverview statsData={statsData} />
        </View>
        <SessionsCalendar
          drinkingSessionData={state.drinkingSessionData}
          preferences={state.preferences}
          visibleDateObject={state.visibleDateObject}
          dispatch={dispatch}
          onDayPress={(day: DateObject) => {}}
        />
        <View style={styles.bottomContainer}>
          {user?.uid !== userId ? (
            <TouchableOpacity
              style={styles.manageFriendButton}
              onPress={() =>
                dispatch({
                  type: 'SET_MANAGE_FRIEND_MODAL_VISIBLE',
                  payload: true,
                })
              }>
              <Text style={styles.manageFriendButtonText}>Manage</Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
        <View style={{height: 200, backgroundColor: '#ffff99'}}></View>
        <ItemListPopup
          visible={state.manageFriendModalVisible}
          transparent={true}
          heading={'Manage Friend'}
          actions={manageFriendData}
          onRequestClose={() =>
            dispatch({type: 'SET_MANAGE_FRIEND_MODAL_VISIBLE', payload: false})
          }
        />
        <YesNoPopup
          visible={state.unfriendModalVisible}
          transparent={true}
          message={'Do you really want to\nunfriend this user?'}
          onRequestClose={() =>
            dispatch({type: 'SET_UNFRIEND_MODAL_VISIBLE', payload: false})
          }
          onYes={handleUnfriend}
        />
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
  bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  manageFriendButton: {
    width: '30%',
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'black',
    margin: 10,
  },
  manageFriendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});
