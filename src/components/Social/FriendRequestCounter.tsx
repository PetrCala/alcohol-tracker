import {StyleSheet, Text, View} from 'react-native';

type FriendRequestCounterProps = {
  count: number | undefined;
  style?: any;
};

/** A small circle to display the number of received friend requests
 *
 * Only display the counter if the number is defined and greater than 0
 */
const FriendRequestCounter: React.FC<FriendRequestCounterProps> = ({
  count,
  style,
}) => {
  return count && count > 0 ? (
    <View style={[styles.friendRequestCounter, style && style]}>
      <Text style={styles.friendRequestCounterValue}>{count}</Text>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  friendRequestCounter: {
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    marginLeft: 10,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  friendRequestCounterValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default FriendRequestCounter;
