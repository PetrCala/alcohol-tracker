import {Keyboard, View} from 'react-native';
import {useState, forwardRef, useEffect} from 'react';
import type {Database} from 'firebase/database';
import {useFirebase} from '@src/context/global/FirebaseContext';
import type {SearchWindowRef} from '@src/types/various/Search';
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

const SearchWindow = forwardRef<SearchWindowRef, SearchWindowProps>(
  ({windowText, onSearch, onResetSearch, searchOnTextChange}, parentRef) => {
    const styles = useThemeStyles();
    const {db} = useFirebase();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState<string>('');

    const handleDoSearch = (searchText: string, database?: Database): void => {
      onSearch(searchText, database);
      if (!searchOnTextChange) {
        Keyboard.dismiss();
      }
    };

    const handleResetSearch = () => {
      onResetSearch();
      setSearchText('');
    };

    useEffect(() => {
      if (searchOnTextChange) {
        handleDoSearch(searchText, db);
      }
    }, [searchText]);

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
            onPress={() => handleDoSearch(searchText, db)}
            text={translate('common.search')}
            style={[styles.borderRadiusSmall, styles.justifyContentCenter]}
          />
        )}
      </View>
    );
  },
);

export default SearchWindow;
