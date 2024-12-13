import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import * as Utils from '@libs/Utils';
import MenuIcon from '@components/Buttons/MenuIcon';
import {
  changeDateBySomeDays,
  unitsToColors,
  dateStringToDate,
} from '@libs/DataHandling';
import UserOffline from '@components/UserOfflineModal';
import {useUserConnection} from '@context/global/UserConnectionContext';
import type {DrinkingSession, DrinkingSessionList} from '@src/types/onyx';
import {useFirebase} from '@src/context/global/FirebaseContext';
import type DrinkingSessionKeyValue from '@src/types/utils/databaseUtils';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DayOverviewNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as DS from '@userActions/DrinkingSession';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import CONST from '@src/CONST';
import ScreenWrapper from '@components/ScreenWrapper';
import {nonMidnightString} from '@libs/StringUtilsKiroku';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import {endOfToday, format} from 'date-fns';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import DateUtils from '@libs/DateUtils';
import Onyx, {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type DayOverviewScreenProps = StackScreenProps<
  DayOverviewNavigatorParamList,
  typeof SCREENS.DAY_OVERVIEW.ROOT
>;

function DayOverviewScreen({route}: DayOverviewScreenProps) {
  const {date} = route.params;
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const theme = useTheme();
  const [loadingText] = useOnyx(ONYXKEYS.APP_LOADING_TEXT);
  const {drinkingSessionData, preferences, userData} = useDatabaseData();
  const [currentDate, setCurrentDate] = useState<Date>(
    date ? dateStringToDate(date) : new Date(),
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [dailyData, setDailyData] = useState<DrinkingSessionKeyValue[]>([]);

  // Monitor the combined data
  useMemo(() => {
    if (!drinkingSessionData) {
      setDailyData([]);
      return;
    }
    const relevantData = DSUtils.getSingleDayDrinkingSessions(
      currentDate,
      drinkingSessionData,
      false,
    ) as DrinkingSessionList;
    const newDailyData = Object.entries(relevantData).map(
      ([sessionId, session]) => {
        return {
          sessionId,
          session,
        };
      },
    );
    setDailyData(newDailyData);
  }, [currentDate, drinkingSessionData]);

  const onSessionButtonPress = async (
    sessionId: string,
    session: DrinkingSession,
  ) => {
    if (!session?.ongoing) {
      Navigation.navigate(ROUTES.DRINKING_SESSION_SUMMARY.getRoute(sessionId));
      return;
    }
    await Onyx.set(ONYXKEYS.ONGOING_SESSION_DATA, session);
    DS.navigateToOngoingSessionScreen();
  };

  function DrinkingSession({sessionId, session}: DrinkingSessionKeyValue) {
    if (!preferences) {
      return;
    }

    // Calculate the session color
    const totalUnits = DSUtils.calculateTotalUnits(
      session.drinks,
      preferences.drinks_to_units,
      true,
    );
    const unitsToColorsInfo = preferences.units_to_colors;
    let sessionColor = unitsToColors(totalUnits, unitsToColorsInfo);
    if (session.blackout === true) {
      sessionColor = 'black';
    }
    // Convert the timestamp to a Date object
    const timeString = nonMidnightString(
      DateUtils.getLocalizedTime(session.start_time, session.timezone),
    );
    const shouldDisplayTime = session.type === CONST.SESSION.TYPES.LIVE;

    return (
      <View style={[styles.flexRow, styles.ph1, styles.mb1]}>
        <View
          style={[styles.border, styles.dayOverviewTabIndicator(sessionColor)]}
        />
        <View style={[styles.border, styles.dayOverviewTab, styles.pr2]}>
          <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <View style={styles.flex1}>
              <TouchableOpacity
                accessibilityRole="button"
                style={localStyles.menuDrinkingSessionButton}
                onPress={() => onSessionButtonPress(sessionId, session)}>
                <Text style={[styles.textNormalThemeText, styles.p1]}>
                  {translate('common.units')}: {totalUnits}
                </Text>
                {shouldDisplayTime && (
                  <Text style={[styles.textNormalThemeText, styles.p1]}>
                    {translate('common.time')}: {nonMidnightString(timeString)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {session?.ongoing ? (
              <Button
                danger
                onPress={() => onSessionButtonPress(sessionId, session)}
                text={translate('dayOverviewScreen.ongoing')}
              />
            ) : (
              editMode && (
                <Button
                  large
                  style={styles.bgTransparent}
                  icon={KirokuIcons.Edit}
                  onPress={() =>
                    DS.navigateToEditSessionScreen(sessionId, session)
                  } // Use keyextractor to load id here
                />
              )
            )}
          </View>
        </View>
      </View>
    );
  }

  const renderDrinkingSession = ({item}: {item: DrinkingSessionKeyValue}) => {
    return (
      <DrinkingSession sessionId={item.sessionId} session={item.session} />
    );
  };

  const noDrinkingSessionsComponent = () => {
    return (
      <Text style={[styles.noResultsText, styles.mb2]}>
        {translate('dayOverviewScreen.noDrinkingSessions')}
      </Text>
    );
  };

  const addSessionButton = () => {
    if (date == null) {
      return <FlexibleLoadingIndicator />;
    }
    if (!editMode || !user) {
      return null;
    } // Do not display outside edit mode

    // No button if the date is in the future
    if (currentDate >= endOfToday()) {
      return null;
    }

    const onAddSessionButtonPress = async () => {
      try {
        await Utils.setLoadingText(translate('liveSessionScreen.loading'));
        const newSession = await DS.getNewSessionToEdit(
          db,
          auth.currentUser,
          currentDate,
          userData?.timezone?.selected,
        );
        DS.navigateToEditSessionScreen(newSession?.id);
      } catch (error) {
        ErrorUtils.raiseAlert(error);
      } finally {
        await Utils.setLoadingText(null);
      }
    };

    return (
      <TouchableOpacity
        accessibilityRole="button"
        style={[localStyles.addSessionButton, styles.buttonSuccess]}
        onPress={onAddSessionButtonPress}>
        <Icon
          src={KirokuIcons.Plus}
          height={36}
          width={36}
          fill={theme.textLight}
        />
      </TouchableOpacity>
    );
  };

  /** Offset the "date" hook by a number of days.
   *
   * @param days Number of days to change the day by.
   */
  const changeDay = (days: number) => {
    if (date != null) {
      const newDate = changeDateBySomeDays(currentDate, days);
      setCurrentDate(newDate);
    }
  };

  if (!isOnline) {
    return <UserOffline />;
  }
  if (!date) {
    return <FullScreenLoadingIndicator />;
  }
  if (!user) {
    return;
  }

  return (
    <ScreenWrapper testID={DayOverviewScreen.displayName}>
      <HeaderWithBackButton
        onBackButtonPress={Navigation.goBack}
        customRightButton={
          <Button
            onPress={() => setEditMode(!editMode)}
            text={translate(
              !editMode
                ? 'dayOverviewScreen.enterEditMode'
                : 'dayOverviewScreen.exitEditMode',
            )}
            style={[
              styles.buttonMedium,
              !editMode ? styles.buttonSuccess : styles.buttonSuccessPressed,
            ]}
            textStyles={styles.buttonLargeText}
          />
        }
      />
      <View style={localStyles.dayOverviewContainer}>
        <Text
          style={[styles.textHeadlineH1, styles.alignSelfCenter, styles.mb2]}>
          {date
            ? format(currentDate, CONST.DATE.SHORT_DATE_FORMAT)
            : 'Loading date...'}
        </Text>
        <FlatList
          data={dailyData}
          renderItem={renderDrinkingSession}
          keyExtractor={item => String(item.sessionId)} // Use start time as id
          ListEmptyComponent={noDrinkingSessionsComponent}
          ListFooterComponent={addSessionButton}
          ListFooterComponentStyle={localStyles.addSessionButtonContainer}
        />
      </View>
      <View style={styles.bottomTabBarContainer}>
        <MenuIcon
          iconId="navigate-day-back"
          iconSource={KirokuIcons.ArrowBack}
          containerStyle={localStyles.footerArrowContainer}
          iconStyle={[localStyles.dayArrowIcon, localStyles.previousDayArrow]}
          onPress={() => {
            changeDay(-1);
          }}
        />
        <MenuIcon
          iconId="navigate-day-forward"
          iconSource={KirokuIcons.ArrowBack}
          containerStyle={localStyles.footerArrowContainer}
          iconStyle={[localStyles.dayArrowIcon, localStyles.nextDayArrow]}
          onPress={() => {
            changeDay(1);
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

const screenWidth = Dimensions.get('window').width;

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  dayOverviewContainer: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: 10,
    borderRadius: 10,
  },
  menuDrinkingSessionButton: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 5,
  },
  addSessionButton: {
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center', // Center the text within the button
  },
  addSessionImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
    alignItems: 'center',
  },
  addSessionButtonContainer: {
    padding: 10,
    alignSelf: 'center',
  },
  footerArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth / 2,
    height: 50,
  },
  dayArrowIcon: {
    width: 25,
    height: 25,
    tintColor: 'black',
    marginHorizontal: 20,
  },
  previousDayArrow: {
    alignSelf: 'flex-start',
  },
  nextDayArrow: {
    transform: [{rotate: '180deg'}],
    alignSelf: 'flex-end',
  },
  ongoingSessionButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

DayOverviewScreen.displayName = 'Day Overview Screen';
export default DayOverviewScreen;
