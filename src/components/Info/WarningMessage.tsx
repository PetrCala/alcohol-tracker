import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Text from '@components/Text';

type WarningMessageProps = {
  warningText: string;
  dispatch: React.Dispatch<any>;
};

const WarningMessage: React.FC<WarningMessageProps> = ({
  warningText,
  dispatch,
}) => {
  return (
    warningText && (
      <View style={[styles.infoContainer, styles.warningInfoContainer]}>
        <TouchableOpacity
          id={'warning'}
          testID={'warning'}
          accessibilityRole="button"
          onPress={() => dispatch({type: 'SET_WARNING', payload: ''})}
          style={styles.infoButton}>
          <Text style={[styles.infoText, styles.warningInfoText]}>
            {warningText}
          </Text>
        </TouchableOpacity>
      </View>
    )
  );
};

export default WarningMessage;

const styles = StyleSheet.create({
  infoContainer: {
    width: '80%',
    height: 'auto',
    position: 'absolute', // Temp
    top: 70, // Temp
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    alignSelf: 'center',
  },
  warningInfoContainer: {
    backgroundColor: '#fce3e1',
    borderColor: 'red',
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
  warningInfoText: {
    color: 'red',
  },
});
