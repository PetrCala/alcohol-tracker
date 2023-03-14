// Rework later

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../styles';

const startSessionButton = (onPress:any) => {

  return (
    <TouchableOpacity onPress={onPress} style={styles.startSessionButton}>
      <Text style={styles.startSessionText}>+</Text>
    </TouchableOpacity>
  );
};

export default startSessionButton;