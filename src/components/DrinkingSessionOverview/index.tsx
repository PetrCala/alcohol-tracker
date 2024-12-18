import React from 'react';
import {View} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {unitsToColors} from '@libs/DataHandling';
import type {DrinkingSession} from '@src/types/onyx';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import * as DS from '@userActions/DrinkingSession';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import CONST from '@src/CONST';
import {nonMidnightString} from '@libs/StringUtilsKiroku';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from '@components/Text';
import DateUtils from '@libs/DateUtils';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {PressableWithFeedback} from '@components/Pressable';
import {DrinkingSessionOverviewProps} from './types';

function DrinkingSessionOverview({
  sessionId,
  session,
  isEditModeOn,
}: DrinkingSessionOverviewProps) {
  const {preferences} = useDatabaseData();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  // Convert the timestamp to a Date object
  const timeString = nonMidnightString(
    DateUtils.getLocalizedTime(session.start_time, session.timezone),
  );
  const shouldDisplayTime = session.type === CONST.SESSION.TYPES.LIVE;

  const onSessionButtonPress = (
    sessionId: string,
    session: DrinkingSession,
  ) => {
    (async () => {
      if (!session?.ongoing) {
        Navigation.navigate(
          ROUTES.DRINKING_SESSION_SUMMARY.getRoute(sessionId),
        );
        return;
      }
      await Onyx.set(ONYXKEYS.ONGOING_SESSION_DATA, session);
      DS.navigateToOngoingSessionScreen();
    })();
  };

  // Calculate the session color
  const totalUnits = DSUtils.calculateTotalUnits(
    session.drinks,
    preferences?.drinks_to_units,
    true,
  );
  let sessionColor = unitsToColors(totalUnits, preferences?.units_to_colors);
  if (session.blackout === true) {
    sessionColor = 'black';
  }

  {
    /* // style={[styles.drinkingSessionOverview, {backgroundColor: 'pink'}]} */
  }
  return (
    <PressableWithFeedback
      accessibilityLabel={translate(
        'dayOverviewScreen.sessionWindow',
        sessionId,
      )}
      style={[styles.flexRow, styles.border, styles.mh1, styles.mt1]}
      onPress={() => onSessionButtonPress(sessionId, session)}>
      <View
        style={[styles.drinkingSessionOverviewTabIndicator(sessionColor)]}
      />
      <View
        style={[
          styles.drinkingSessionOverviewMainTab,
          styles.borderLeft,
          styles.pr2,
          styles.pl1,
        ]}>
        <View style={[styles.flexGrow1, styles.flexColumn]}>
          <Text style={[styles.textNormalThemeText, styles.p1]}>
            {translate('common.units')}: {totalUnits}
          </Text>
          {shouldDisplayTime && (
            <Text style={[styles.textNormalThemeText, styles.p1]}>
              {translate('common.time')}: {nonMidnightString(timeString)}
            </Text>
          )}
        </View>
        {session?.ongoing ? (
          <Button
            danger
            onPress={() => onSessionButtonPress(sessionId, session)}
            text={translate('dayOverviewScreen.ongoing')}
          />
        ) : (
          isEditModeOn && (
            <Button
              large
              style={styles.bgTransparent}
              icon={KirokuIcons.Edit}
              onPress={() => DS.navigateToEditSessionScreen(sessionId, session)} // Use keyextractor to load id here
            />
          )
        )}
      </View>
    </PressableWithFeedback>
  );
}

export default DrinkingSessionOverview;
