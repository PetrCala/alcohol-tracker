import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Text from '@components/Text';

type SuccessMessageProps = {
  successText: string;
  dispatch: React.Dispatch<any>;
};

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  successText,
  dispatch,
}) => {
  return (
    successText && (
      <View style={[styles.infoContainer, styles.successInfoContainer]}>
        <TouchableOpacity
          id="success"
          testID="success"
          accessibilityRole="button"
          onPress={() => dispatch({type: 'SET_SUCCESS', payload: ''})}
          style={styles.infoButton}>
          <Text style={[styles.infoText, styles.successInfoText]}>
            {successText}
          </Text>
        </TouchableOpacity>
      </View>
    )
  );
};

export default SuccessMessage;

const styles = StyleSheet.create({
  infoContainer: {
    width: '80%',
    height: 'auto',
    position: 'absolute', // Temp
    top: 50, // Temp
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    alignSelf: 'center',
  },
  successInfoContainer: {
    backgroundColor: '#e3f0d5',
    borderColor: 'green',
  },
  infoButton: {
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  infoText: {
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
  },
  successInfoText: {
    color: 'green',
  },
});
