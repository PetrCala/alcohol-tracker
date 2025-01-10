import {Keyboard, StyleSheet, View} from 'react-native';
import {useState, forwardRef, useEffect, useRef} from 'react';
import type {Database} from 'firebase/database';
import {useFirebase} from '@src/context/global/FirebaseContext';
import type {SearchWindowRef} from '@src/types/various/Search';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from '@components/Icon';
import variables from '@src/styles/variables';
import TextInput from '@components/TextInput';
import useStyleUtils from '@hooks/useStyleUtils';
import {PressableWithFeedback} from '@components/Pressable';
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
    const StyleUtils = useStyleUtils();
    const [searchText, setSearchText] = useState<string>('');
    const [searchCount, setSearchCount] = useState<number>(0);
    // const textInputRef = useRef<TextInput>(null); // Input field ref for focus handling

    const handleDoSearch = (searchText: string, database?: Database): void => {
      onSearch(searchText, database);
      if (!searchOnTextChange) {
        setSearchCount(searchCount + 1);
        Keyboard.dismiss();
      }
    };

    const handleResetSearch = () => {
      onResetSearch();
      setSearchText('');
      setSearchCount(0);
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
          <Icon
            src={KirokuIcons.Search}
            medium
            fill={StyleUtils.getIconFillColor()}
            additionalStyles={[styles.alignSelfCenter, styles.mh3]}
          />
          <TextInput
            // autoGrow
            placeholder={windowText}
            value={searchText}
            onChangeText={text => setSearchText(text)}
            shouldShowClearButton={!!searchText}
            autoGrow
          />
          {/* <TextInput
              accessibilityLabel={translate('textInput.accessibilityLabel')}
              placeholder={windowText}
              placeholderTextColor="#a8a8a8"
              value={searchText}
              onChangeText={text => setSearchText(text)}
              style={styles.searchWindowText}
              keyboardType="default"
              textContentType="nickname"
              ref={textInputRef}
            /> */}
          {searchText !== '' ||
            (searchCount > 0 && (
              <PressableWithFeedback
                accessibilityLabel={translate('textInput.resetSearch')}
                onPress={handleResetSearch}
                style={localStyles.searchTextResetContainer}>
                <Icon
                  src={KirokuIcons.ThinX}
                  small
                  fill={StyleUtils.getIconFillColor()}
                />
              </PressableWithFeedback>
            ))}
        </View>
        {!searchOnTextChange && (
          <View
            style={[
              styles.justifyContentCenter,
              styles.alignItemsCenter,
              styles.pl2,
            ]}>
            <Button
              onPress={() => handleDoSearch(searchText, db)}
              text={translate('common.search')}
              style={[styles.borderRadiusSmall, styles.buttonSuccess]}
            />
          </View>
        )}
      </View>
    );
  },
);

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  searchTextResetContainer: {
    width: '10%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchWindow;
