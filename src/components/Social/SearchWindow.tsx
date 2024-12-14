import {Keyboard, StyleSheet, TextInput, View} from 'react-native';
import {useState, forwardRef, useEffect, useRef} from 'react';
import type {Database} from 'firebase/database';
import {useFirebase} from '@src/context/global/FirebaseContext';
import type {SearchWindowRef} from '@src/types/various/Search';
import KeyboardFocusHandler from '@components/Keyboard/KeyboardFocusHandler';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from '@components/Icon';
import useStyleUtils from '@hooks/useStyleUtils';
import {PressableWithFeedback} from '@components/Pressable';

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
    const StyleUtils = useStyleUtils();
    const [searchText, setSearchText] = useState<string>('');
    const [searchCount, setSearchCount] = useState<number>(0);
    const textInputRef = useRef<TextInput>(null); // Input field ref for focus handling

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
        <View
          style={[
            localStyles.textContainer,
            searchOnTextChange && localStyles.responsiveTextContainer,
            styles.searchWindowTextContainer,
          ]}>
          <KeyboardFocusHandler>
            <Icon
              src={KirokuIcons.Search}
              medium
              fill={StyleUtils.getIconFillColor()}
              additionalStyles={[styles.alignSelfCenter, styles.mh3]}
            />
            <TextInput
              accessibilityLabel="Text input field"
              placeholder={windowText}
              placeholderTextColor="#a8a8a8"
              value={searchText}
              onChangeText={text => setSearchText(text)}
              style={styles.searchWindowText}
              keyboardType="default"
              textContentType="nickname"
              ref={textInputRef}
            />
          </KeyboardFocusHandler>
          {searchText !== '' ||
            (searchCount > 0 && (
              <PressableWithFeedback
                accessibilityLabel="Reset search"
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
        {searchOnTextChange ? null : (
          <View
            style={[
              styles.justifyContentCenter,
              styles.alignItemsCenter,
              styles.pl2,
            ]}>
            <Button
              onPress={() => handleDoSearch(searchText, db)}
              text="Search"
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
  textContainer: {
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  responsiveTextContainer: {
    width: '100%',
  },
  searchTextResetContainer: {
    width: '10%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchWindow;
