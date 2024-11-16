import React, {ForwardedRef, useState} from 'react';
import {View} from 'react-native';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import TIMEZONES from '@src/TIMEZONES';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {SelectedTimezone} from '@src/types/onyx/UserData';

/**
 * We add the current time to the key to fix a bug where the list options don't update unless the key is updated.
 */
const getKey = (text: string): string => `${text}-${new Date().getTime()}`;

type TimezoneSelectProps = {
  /** Callback when a timezone is selected */
  onSelectedTimezone?: (timezone: SelectedTimezone) => void;

  /** Id to use for this timezone select */
  id?: string;
};

function TimezoneSelect(
  {onSelectedTimezone, id = '', ...rest}: TimezoneSelectProps,
  ref: ForwardedRef<View>,
) {
  const {translate} = useLocalize();
  const {userData} = useDatabaseData();
  const timezone = userData?.timezone ?? CONST.DEFAULT_TIME_ZONE; // TODO change this to onyx user timezone
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

  const handleSelectRow = (item: {
    text: string;
    keyForList: string;
    isSelected: boolean;
  }) => {
    if (onSelectedTimezone) {
      onSelectedTimezone(item.text as SelectedTimezone);
    }
  };

  return (
    <SelectionList
      headerMessage={
        timezoneInputText.trim() && !timezoneOptions.length
          ? translate('common.noResultsFound')
          : ''
      }
      textInputLabel={translate('timezoneScreen.timezone')}
      textInputValue={timezoneInputText}
      onChangeText={filterShownTimezones}
      onSelectRow={handleSelectRow}
      shouldSingleExecuteRowSelect
      sections={[{data: timezoneOptions, isDisabled: timezone.automatic}]}
      initiallyFocusedOptionKey={
        timezoneOptions.find(tz => tz.text === timezone.selected)?.keyForList
      }
      showScrollIndicator
      shouldShowTooltips={false}
      ListItem={RadioListItem}
    />
  );
}

TimezoneSelect.displayName = 'TimezoneSelect';
export default TimezoneSelect;
