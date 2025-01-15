import {Keyboard, View} from 'react-native';
import {useState, useEffect, useCallback} from 'react';
import type {Database} from 'firebase/database';
import {useFirebase} from '@src/context/global/FirebaseContext';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';

type SearchWindowProps = {
  windowText: string;
  onSearch: (searchText: string, database?: Database) => Promise<void> | void;
  onResetSearch: () => void;
  searchOnTextChange?: boolean;
};

function SearchWindow({
  windowText,
  onSearch,
  onResetSearch,
  searchOnTextChange,
}: SearchWindowProps) {
  const styles = useThemeStyles();
  const {db} = useFirebase();
  const {translate} = useLocalize();
  const [searchText, setSearchText] = useState<string>('');

  const handleDoSearch = useCallback(
    (text: string) => {
      onSearch(text, db);
      if (!searchOnTextChange) {
        Keyboard.dismiss();
      }
    },
    [db, onSearch, searchOnTextChange],
  );

  const handleResetSearch = () => {
    onResetSearch();
    setSearchText('');
  };

  useEffect(() => {
    if (!searchOnTextChange) {
      return;
    }

    handleDoSearch(searchText);
    // Including the handleDoSearch function causes an infinite loop
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
  }, [searchText, searchOnTextChange]);

  // useImperativeHandle(parentRef, () => ({
  //   focus: () => {
  //     inputRef.current?.focus();
  //   },
  // }));

  return (
    <View style={styles.searchWindowContainer}>
      <View style={styles.searchWindowTextContainer}>
        <TextInput
          accessibilityLabel={translate('textInput.accessibilityLabel')}
          placeholder={windowText}
          value={searchText}
          iconLeft={KirokuIcons.Search}
          onChangeText={text => setSearchText(text)}
          shouldShowClearButton
          containerStyles={styles.flexGrow1}
          hideFocusedState
          textInputContainerStyles={styles.noBorder}
          onClear={handleResetSearch}
        />
      </View>
      {!searchOnTextChange && (
        <Button
          success
          onPress={() => handleDoSearch(searchText)}
          text={translate('common.search')}
          style={[styles.borderRadiusSmall, styles.justifyContentCenter]}
        />
      )}
    </View>
  );
}

export default SearchWindow;
