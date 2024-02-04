import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useState, forwardRef, useRef, useImperativeHandle} from 'react';
import {Database} from 'firebase/database';
import {useFirebase} from '@src/context/global/FirebaseContext';
import {SearchWindowRef} from '@src/types/search';

type SearchWindowProps = {
  doSearch: (db: Database, searchText: string) => void;
  onResetSearch: () => void;
};

const SearchWindow = forwardRef<SearchWindowRef, SearchWindowProps>(
  ({doSearch, onResetSearch}, parentRef) => {
    const db = useFirebase().db;
    const inputRef = useRef<TextInput>(null); // Input field ref for focus handling
    const [searchText, setSearchText] = useState<string>('');
    const [searchCount, setSearchCount] = useState<number>(0);

    const handleDoSearch = (db: Database, searchText: string): void => {
      if (searchText) {
        doSearch(db, searchText);
        setSearchCount(searchCount + 1);
        Keyboard.dismiss();
      }
    };

    const handleResetSearch = () => {
      onResetSearch();
      setSearchText('');
      setSearchCount(0);
    };

    useImperativeHandle(parentRef, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    return (
      <View style={styles.mainContainer}>
        <View style={styles.textContainer}>
          <TextInput
            placeholder="Search for a user"
            value={searchText}
            onChangeText={text => setSearchText(text)}
            style={styles.searchText}
            keyboardType="default"
            textContentType="nickname"
            ref={inputRef}
          />
          {searchText !== '' || searchCount > 0 ? (
            <TouchableOpacity
              onPress={handleResetSearch}
              style={styles.searchTextResetContainer}>
              <Image
                style={styles.searchTextResetImage}
                source={require('../../../assets/icons/thin_x.png')}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.searchButtonContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => handleDoSearch(db, searchText)}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  mainContainer: {
    width: '95%',
    height: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
  },
  textContainer: {
    width: '80%',
    height: '90%',
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  searchText: {
    height: '100%',
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // justifyContent: 'space-between',
    paddingLeft: 10,
  },
  searchTextResetContainer: {
    width: '10%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTextResetImage: {
    width: 15,
    height: 15,
    tintColor: 'gray',
  },
  searchButtonContainer: {
    width: '20%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchButton: {
    width: '95%',
    height: '90%',
    backgroundColor: '#fcf50f',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    marginLeft: '5%',
  },
  searchButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SearchWindow;
