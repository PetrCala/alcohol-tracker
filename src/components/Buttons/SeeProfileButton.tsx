import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

type SeeProfileButtonProps = {
  onPress: () => void;
};

const SeeProfileButton: React.FC<SeeProfileButtonProps> = ({onPress}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>See profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 'auto',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  button: {
    width: 100,
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fcf50f',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    padding: 5,
  },
});

export default SeeProfileButton;
