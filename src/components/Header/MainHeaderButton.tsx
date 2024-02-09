import BasicButton from '../Buttons/BasicButton';
import {StyleSheet, View} from 'react-native';
import commonStyles from '@src/styles/commonStyles';

type MainHeaderButtonProps = {
  buttonOn: boolean;
  textOn: string;
  textOff: string;
  onPress: () => void;
};

const MainHeaderButton: React.FC<MainHeaderButtonProps> = ({
  buttonOn,
  textOn,
  textOff,
  onPress,
}) => {
  return (
    <View style={commonStyles.headerRightContainer}>
      <BasicButton
        text={buttonOn ? textOn : textOff}
        buttonStyle={[
          styles.headerButton,
          buttonOn ? styles.headerButtonEnabled : {},
        ]}
        textStyle={styles.headerButtonText}
        onPress={() => onPress()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fcf50f',
    marginRight: 10,
  },
  headerButtonEnabled: {
    backgroundColor: '#FFFF99',
    width: 170,
  },
  headerButtonText: {
    color: 'black',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MainHeaderButton;
