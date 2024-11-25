import React from 'react';
import {View} from 'react-native';
import headerStyles from '@src/styles/headerStyles';
import Text from '@components/Text';

type GrayHeaderProps = {
  headerText: string;
};

const GrayHeader: React.FC<GrayHeaderProps> = ({headerText}) => {
  return (
    <View style={headerStyles.grayHeaderContainer}>
      <Text style={headerStyles.grayHeaderText}>{headerText}</Text>
    </View>
  );
};

export default GrayHeader;
