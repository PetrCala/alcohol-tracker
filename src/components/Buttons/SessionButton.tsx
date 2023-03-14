import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../../styles';

type Props = {
  onPress: () => void;
}

const StartSessionButton = (props: Props) => {
  const { onPress } = props;

  return(
      <TouchableOpacity onPress={onPress} style={styles.startSessionButton}>
        <Text style={styles.startSessionText}>+</Text>
      </TouchableOpacity>
  );
};

export default StartSessionButton;