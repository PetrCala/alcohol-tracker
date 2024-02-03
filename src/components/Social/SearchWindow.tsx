import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useState} from 'react';
import {Database} from 'firebase/database';
import {useFirebase} from '@src/context/FirebaseContext';

type SearchWindowProps = {
  doSearch: (db: Database, searchText: string) => void;
  onResetSearch: () => void;
};

const SearchWindow: React.FC<SearchWindowProps> = ({
  doSearch,
  onResetSearch,
}) => {
  const db = useFirebase().db;
  const [searchText, setSearchText] = useState<string>('');
  const [searchCount, setSearchCount] = useState<number>(0);

  const handleDoSearch = (db: Database, searchText: string): void => {
    doSearch(db, searchText);
    setSearchCount(searchCount + 1);
  };

  const handleResetSearch = () => {
    onResetSearch();
    setSearchText('');
    setSearchCount(0);
  };

  return (
    <>
      <View style={styles.textContainer}>
        <TextInput
          placeholder="Search for a user"
          value={searchText}
          onChangeText={text => setSearchText(text)}
          style={styles.searchText}
          keyboardType="default"
          textContentType="nickname"
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
    </>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    width: '95%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'center',
  },
  searchText: {
    height: '100%',
    width: '90%',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
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
    width: '95%',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 5,
  },
  searchResultsContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  searchButton: {
    width: '100%',
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SearchWindow;
