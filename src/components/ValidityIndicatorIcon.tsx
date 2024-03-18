import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';
import CONST from '@src/CONST';

const ValidityIndicatorIcon: React.FC<{
  isValid: boolean;
}> = ({isValid}) => {
  return (
    <View style={[styles.container, isValid ? styles.match : styles.mismatch]}>
      <Image
        source={isValid ? KirokuIcons.Check : KirokuIcons.Close}
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'purple',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  icon: {
    width: 12,
    height: 12,
    tintColor: 'white',
  },
  match: {
    backgroundColor: 'green',
  },
  mismatch: {
    backgroundColor: 'red',
  },
});

export default ValidityIndicatorIcon;
