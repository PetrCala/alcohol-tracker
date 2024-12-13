import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import React from 'react';
import type {StyleProp, ViewStyle, TextStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';

type OrDelimiterProps = {
  containerStyle?: StyleProp<ViewStyle>;
  lineStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function OrDelimiter({containerStyle, lineStyle, textStyle}: OrDelimiterProps) {
  const {translate} = useLocalize();
  const styles = useThemeStyles();

  return (
    <View style={[styles.orDelimiterContainer, containerStyle]}>
      <View style={[styles.orDelimiterLine, lineStyle]} />
      <Text style={[styles.mutedTextLabel, styles.textAlignCenter, textStyle]}>
        {translate('common.or').toUpperCase()}
      </Text>
      <View style={[styles.orDelimiterLine, lineStyle]} />
    </View>
  );
}

OrDelimiter.displayName = 'OrDelimiter';
export default OrDelimiter;
