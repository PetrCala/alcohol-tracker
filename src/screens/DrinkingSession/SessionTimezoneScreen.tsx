import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as DS from '@userActions/DrinkingSession';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import Text from '@components/Text';
import TimezoneSelect from '@components/TimezoneSelect';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/UserData';
import ConfirmModal from '@components/ConfirmModal';
import CONST from '@src/CONST';

type SessionTimezoneScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SESSION_TIMEZONE_SCREEN
>;

function SesssionTimezoneScreen({route}: SessionTimezoneScreenProps) {
  const {sessionId} = route.params;
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const session = DSUtils.getDrinkingSessionData(sessionId);
  const initialTimezone: Timezone = {
    selected: session?.timezone ?? CONST.DEFAULT_TIME_ZONE.selected,
    automatic: false,
  };
  const [selectedTimezone, setSelectedTimezone] =
    useState<SelectedTimezone | null>(null);

  const onConfirm = (timezone: SelectedTimezone | null) => {
    if (!session || !timezone) {
      throw new Error(
        translate('sessionTimezoneScreen.error.errorSelectTimezone'),
      );
    }
    DS.updateTimezone(session, timezone);
    Navigation.goBack();
    setSelectedTimezone(null);
  };

  const onSelectedTimezone = (timezone: SelectedTimezone) => {
    if (!session) {
      return;
    }
    const isDifferentDay = DSUtils.isDifferentDay(session, timezone);
    if (isDifferentDay) {
      // If the timezone would change the session day, show the confirm modal
      setSelectedTimezone(timezone);
      return;
    }

    onConfirm(timezone);
  };

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={SesssionTimezoneScreen.displayName}>
      <HeaderWithBackButton
        title={translate('sessionTimezoneScreen.title')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      <Text style={[styles.mb2, styles.mh5]}>
        {translate('sessionTimezoneScreen.description')}
      </Text>
      <Text style={[styles.mb6, styles.mh5, styles.mutedTextLabel]}>
        {translate('sessionTimezoneScreen.note')}
      </Text>
      <TimezoneSelect
        initialTimezone={initialTimezone}
        onSelectedTimezone={timezone => onSelectedTimezone(timezone)}
      />
      <ConfirmModal
        danger
        title={translate('common.warning')}
        prompt={translate(
          'sessionTimezoneScreen.confirmPrompt',
          selectedTimezone ?? '',
        )}
        confirmText={translate('common.yesIKnowWhatIAmDoing')}
        cancelText={translate('common.cancel')}
        isVisible={!!selectedTimezone}
        onConfirm={() => onConfirm(selectedTimezone)}
        onCancel={() => setSelectedTimezone(null)}
      />
    </ScreenWrapper>
  );
}

SesssionTimezoneScreen.displayName = 'SesssionTimezoneScreen';
export default SesssionTimezoneScreen;
