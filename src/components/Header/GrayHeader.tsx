import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type GrayHeaderProps = {
  headerText: string;
};

const GrayHeader: React.FC<GrayHeaderProps> = ({headerText}) => {
  const styles = useThemeStyles();

  return (
    <View style={styles.grayHeader}>
      <Text style={[styles.headerText, styles.textStrong]}>{headerText}</Text>
    </View>
  );
};

export default GrayHeader;
