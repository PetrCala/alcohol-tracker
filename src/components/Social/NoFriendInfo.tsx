import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {View, Text, TouchableOpacity} from 'react-native';
import {StyleSheet} from 'react-native';

type NoFriendInfoProps = {
  message?: string;
  buttonText?: string;
};

/** A View that informs the users that they have no friends */
const NoFriendInfo: React.FC<NoFriendInfoProps> = ({message, buttonText}) => {
  const defaultMessage = 'You do not have any friends yet';
  const defaultButtonText = 'Add them here';
  return (
    <View style={styles.emptyList}>
      <Text style={styles.emptyListText}>{message ?? defaultMessage}</Text>
      <TouchableOpacity accessibilityRole="button"
        onPress={() => Navigation.navigate(ROUTES.SOCIAL_FRIEND_SEARCH)}
        style={styles.navigateToSearchButton}>
        <Text style={styles.navigateToSearchText}>
          {buttonText ?? defaultButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyList: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '400',
    padding: 20,
  },
  navigateToSearchButton: {
    width: 'auto',
    height: 50,
    backgroundColor: 'white',
    padding: 5,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateToSearchText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NoFriendInfo;
