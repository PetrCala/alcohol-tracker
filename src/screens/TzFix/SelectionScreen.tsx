import React, {useCallback, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import TIMEZONES from '@src/TIMEZONES';
import type {SelectedTimezone} from '@src/types/onyx/UserData';
import type {StackScreenProps} from '@react-navigation/stack';
import type {TzFixModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {UserData} from '@src/types/onyx';
import * as User from '@userActions/User';
import {useFirebase} from '@context/global/FirebaseContext';
import * as ErrorUtils from '@libs/ErrorUtils';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ERRORS from '@src/ERRORS';

/**
 * We add the current time to the key to fix a bug where the list options don't update unless the key is updated.
 */
const getKey = (text: string): string => `${text}-${new Date().getTime()}`;

const getUserTimezone = (userData: UserData | undefined) =>
  userData?.timezone ?? CONST.DEFAULT_TIME_ZONE;

type SelectionScreenProps = StackScreenProps<
  TzFixModalNavigatorParamList,
  typeof SCREENS.TZ_FIX.SELECTION
>;

// eslint-disable-next-line no-empty-pattern
function SelectionScreen({}: SelectionScreenProps) {
  const {translate} = useLocalize();
  const {db, auth} = useFirebase();
  const {userData} = useDatabaseData();
  const timezone = getUserTimezone(userData);
  const allTimezones = useInitialValue(() =>
    TIMEZONES.filter((tz: string) => !tz.startsWith('Etc/GMT')).map(
      (text: string) => ({
        text,
        keyForList: getKey(text),
        isSelected: text === timezone.selected,
      }),
    ),
  );
  const [timezoneInputText, setTimezoneInputText] = useState('');
  const [timezoneOptions, setTimezoneOptions] = useState(allTimezones);
  const [isLoading, setIsLoading] = useState(false);

  const saveSelectedTimezone = useCallback(
    async ({text}: {text: string}): Promise<void> => {
      setIsLoading(true);
      try {
        await User.updateAutomaticTimezone(
          db,
          auth.currentUser,
          false,
          text as SelectedTimezone,
        );
        Navigation.navigate(ROUTES.TZ_FIX_CONFIRMATION);
      } finally {
        setIsLoading(false);
      }
    },
    [db, auth.currentUser],
  );

  const handleTimezoneSelection = useCallback(
    ({text}: {text: string}): void => {
      saveSelectedTimezone({text}).catch(error => {
        ErrorUtils.raiseAppError(ERRORS.USER.TIMEZONE_UPDATE_FAILED, error);
      });
    },
    [saveSelectedTimezone, translate],
  );

  const filterShownTimezones = (searchText: string) => {
    setTimezoneInputText(searchText);
    const searchWords = searchText.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    setTimezoneOptions(
      allTimezones.filter(tz =>
        searchWords.every(word =>
          tz.text
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ' ')
            .includes(word),
        ),
      ),
    );
  };

  if (isLoading) {
    return (
      <FullScreenLoadingIndicator
        loadingText={translate('timezoneScreen.saving')}
      />
    );
  }

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={SelectionScreen.displayName}>
      <HeaderWithBackButton
        title={translate('timezoneScreen.timezone')}
        onBackButtonPress={() => Navigation.goBack(ROUTES.TZ_FIX_DETECTION)}
      />
      <SelectionList
        headerMessage={
          timezoneInputText.trim() && !timezoneOptions.length
            ? translate('common.noResultsFound')
            : ''
        }
        textInputLabel={translate('timezoneScreen.timezone')}
        textInputValue={timezoneInputText}
        onChangeText={filterShownTimezones}
        onSelectRow={handleTimezoneSelection}
        shouldSingleExecuteRowSelect
        sections={[{data: timezoneOptions, isDisabled: false}]}
        initiallyFocusedOptionKey={
          timezoneOptions.find(tz => tz.text === timezone.selected)?.keyForList
        }
        showScrollIndicator
        shouldShowTooltips={false}
        ListItem={RadioListItem}
      />
    </ScreenWrapper>
  );
}

SelectionScreen.displayName = 'SelectionScreen';

export default SelectionScreen;
