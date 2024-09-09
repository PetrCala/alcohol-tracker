import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from './Icon';
import * as KirokuIcons from './Icon/KirokuIcons';

type SelectCircleProps = {
  /** Should we show the checkmark inside the circle */
  isChecked: boolean;

  /** Additional styles to pass to SelectCircle */
  selectCircleStyles?: StyleProp<ViewStyle>;
};

function SelectCircle({
  isChecked = false,
  selectCircleStyles,
}: SelectCircleProps) {
  const theme = useTheme();
  const styles = useThemeStyles();

  return (
    <View
      style={[styles.selectCircle, styles.alignSelfCenter, selectCircleStyles]}>
      {isChecked && (
        <Icon src={KirokuIcons.Checkmark} fill={theme.iconSuccessFill} />
      )}
    </View>
  );
}

SelectCircle.displayName = 'SelectCircle';

export default SelectCircle;
