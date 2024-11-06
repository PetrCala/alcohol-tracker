import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import MenuIcon from '@components/Buttons/MenuIcon';
import {
  formatDateToTime,
  getLastDrinkAddedTime,
  sumAllUnits,
  sumAllDrinks,
  sumDrinksOfSingleType,
  timestampToDate,
  unitsToColors,
} from '@libs/DataHandling';
import useLocalize from '@hooks/useLocalize';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import type {DrinkingSession, DrinkKey} from '@src/types/onyx';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {StackScreenProps} from '@react-navigation/stack';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import {useCallback, useEffect, useMemo, useState} from 'react';
import DSUtils from '@libs/DrinkingSessionUtils';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {format} from 'date-fns';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import ScrollView from '@components/ScrollView';
import useTheme from '@hooks/useTheme';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import {TranslationPaths} from '@src/languages/types';
import MenuItemGroup from '@components/MenuItemGroup';

type MenuData = {
  title?: string;
  description?: string;
  rightComponent?: React.ReactNode;
  additionalStyles?: StyleProp<ViewStyle>;
};

type Menu = {
  sectionTranslationKey: TranslationPaths;
  items: MenuData[];
};
type SessionSummaryScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SUMMARY
>;

function SessionSummaryScreen({route}: SessionSummaryScreenProps) {
  const {sessionId} = route.params;
  const {preferences, drinkingSessionData} = useDatabaseData();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const theme = useTheme();
  if (!preferences) {
    return null;
  } // Careful when writing hooks after this line
  const [session, setSession] = useState<DrinkingSession>(
    DSUtils.extractSessionOrEmpty(sessionId, drinkingSessionData),
  );
  // Drinks info
  const totalDrinks = sumAllDrinks(session.drinks);
  const totalUnits = sumAllUnits(session.drinks, preferences.drinks_to_units);
  const drinkSums = {
    small_beer: sumDrinksOfSingleType(session.drinks, 'small_beer'),
    beer: sumDrinksOfSingleType(session.drinks, 'beer'),
    wine: sumDrinksOfSingleType(session.drinks, 'wine'),
    weak_shot: sumDrinksOfSingleType(session.drinks, 'weak_shot'),
    strong_shot: sumDrinksOfSingleType(session.drinks, 'strong_shot'),
    cocktail: sumDrinksOfSingleType(session.drinks, 'cocktail'),
    other: sumDrinksOfSingleType(session.drinks, 'other'),
  };
  // Time info
  const sessionStartDate = timestampToDate(session.start_time);
  const sessionEndDate = timestampToDate(session.end_time);
  const sessionDay = format(sessionStartDate, CONST.DATE.SHORT_DATE_FORMAT);
  const sessionStartTime = formatDateToTime(sessionStartDate);
  const sessionEndTime = formatDateToTime(sessionEndDate);
  const wasLiveSession = session?.type == CONST.SESSION_TYPES.LIVE;
  // Figure out last drink added
  let lastDrinkAdded: string;
  const lastDrinkEditTimestamp = getLastDrinkAddedTime(session);
  if (!lastDrinkEditTimestamp) {
    lastDrinkAdded = 'Unknown';
  } else {
    const lastDrinkAddedDate = timestampToDate(lastDrinkEditTimestamp);
    lastDrinkAdded = formatDateToTime(lastDrinkAddedDate);
  }

  const onEditSessionPress = (sessionId: string) => {
    Navigation.navigate(ROUTES.DRINKING_SESSION_LIVE.getRoute(sessionId));
  };

  const handleBackPress = () => {
    const screenBeforeSummaryScreen = Navigation.getLastScreenName(true);
    if (screenBeforeSummaryScreen === SCREENS.DAY_OVERVIEW.ROOT) {
      Navigation.goBack();
    } else {
      Navigation.navigate(ROUTES.HOME);
    }
  };

  const sessionColor = session.blackout
    ? 'black'
    : unitsToColors(totalUnits, preferences.units_to_colors);

  const generalMenuItemsData: Menu = useMemo(() => {
    return {
      sectionTranslationKey: 'sessionSummaryScreen.generalSection.title',
      items: [
        {
          title: 'Session color',
          rightComponent: (
            <View
              style={[styles.sessionColorMarker(sessionColor), styles.border]}
            />
          ),
        },
        {
          title: 'Units',
          description: totalUnits.toString(),
        },
        {
          title: 'Date',
          description: sessionDay,
        },
        {
          title: 'Start time',
          description: !wasLiveSession ? '-' : sessionStartTime,
        },
        {
          title: 'Last drink added',
          description: !wasLiveSession ? '-' : lastDrinkAdded,
        },
        {
          title: 'End time',
          description: !wasLiveSession ? '-' : sessionEndTime,
        },
        // {
        //   title: 'Timezone',
        //   description: session.timezone ?? '',
        // },
      ],
    };
  }, [session, styles.border]);

  const drinkMenuItemsData: Menu = useMemo(() => {
    return {
      sectionTranslationKey: 'sessionSummaryScreen.drinksSection.title',
      items: [
        {title: 'Drinks', description: totalDrinks.toString()},
        {title: 'Small Beer', description: drinkSums.small_beer.toString()},
        {title: 'Beer', description: drinkSums.beer.toString()},
        {title: 'Wine', description: drinkSums.wine.toString()},
        {title: 'Weak Shot', description: drinkSums.weak_shot.toString()},
        {title: 'Strong Shot', description: drinkSums.strong_shot.toString()},
        {title: 'Cocktail', description: drinkSums.cocktail.toString()},
        {title: 'Other', description: drinkSums.other.toString()},
      ],
    };
  }, [session]);

  const otherMenuItemsData: Menu = useMemo(() => {
    return {
      sectionTranslationKey: 'sessionSummaryScreen.otherSection.title',
      items: [
        {
          title: 'Blackout',
          description: session.blackout ? 'Yes' : 'No',
        },
        {
          title: 'Note',
          description: session.note ?? '',
        },
      ],
    };
  }, [session]);

  const getSessionSummarySection = useCallback((menuItemsData: Menu) => {
    return (
      <Section
        title={translate(menuItemsData.sectionTranslationKey)}
        titleStyles={styles.headerText}
        containerStyles={styles.pb0}
        childrenStyles={styles.pt3}>
        <>
          {menuItemsData.items.map((detail, index) => (
            <MenuItem
              // eslint-disable-next-line react/no-array-index-key
              key={`${detail.title}_${index}`}
              title={detail.title}
              titleStyle={styles.plainSectionTitle}
              description={detail.description}
              descriptionTextStyle={styles.textNormalThemeText}
              wrapperStyle={styles.sectionMenuItemTopDescription}
              style={[
                styles.pt0,
                styles.pb0,
                styles.borderBottomRounded,
                {borderBottomLeftRadius: 35, borderBottomRightRadius: 35},
                index === menuItemsData.items.length - 1 && styles.borderNone,
              ]}
              disabled={true}
              shouldGreyOutWhenDisabled={false}
              shouldUseRowFlexDirection
              shouldShowRightComponent={!!detail.rightComponent}
              rightComponent={detail.rightComponent}
            />
          ))}
        </>
      </Section>
    );
  }, []);

  const generalMenuItems = useMemo(
    () => getSessionSummarySection(generalMenuItemsData),
    [generalMenuItemsData, getSessionSummarySection],
  );
  const drinkMenuItems = useMemo(
    () => getSessionSummarySection(drinkMenuItemsData),
    [drinkMenuItemsData, getSessionSummarySection],
  );
  const otherMenuItems = useMemo(
    () => getSessionSummarySection(otherMenuItemsData),
    [otherMenuItemsData, getSessionSummarySection],
  );

  useEffect(() => {
    const newSession = DSUtils.extractSessionOrEmpty(
      sessionId,
      drinkingSessionData,
    );
    setSession(newSession);
  }, [drinkingSessionData]);

  return (
    <ScreenWrapper testID={SessionSummaryScreen.displayName}>
      <HeaderWithBackButton
        onBackButtonPress={handleBackPress}
        customRightButton={
          !session.ongoing && (
            <Button
              style={styles.bgTransparent}
              icon={KirokuIcons.Edit}
              iconFill={theme.textDark}
              onPress={() => onEditSessionPress(sessionId)} // Use keyextractor to load id here
            />
          )
        }
      />
      <ScrollView>
        <View style={[styles.pb4, styles.alignItemsCenter]}>
          <Text style={styles.textHeadlineH2}>
            {translate('sessionSummaryScreen.title')}
          </Text>
        </View>
        <MenuItemGroup>
          {generalMenuItems}
          {drinkMenuItems}
          {otherMenuItems}
        </MenuItemGroup>
      </ScrollView>
      <View style={styles.bottomTabBarContainer(true)}>
        <Button
          text={translate('common.confirm')}
          onPress={handleBackPress}
          style={styles.bottomTabButton}
          success
        />
      </View>
    </ScreenWrapper>
  );
}

SessionSummaryScreen.displayName = 'Session Summary Screen';
export default SessionSummaryScreen;
