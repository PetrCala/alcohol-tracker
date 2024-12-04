import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ValueOf} from 'type-fest';
import Text from './Text';

type FlexibleLoadingIndicatorProps = {
  /** Style of the loading indicator */
  style?: StyleProp<ViewStyle>;

  /** Size of the loading indicator */
  size?: ValueOf<typeof CONST.ACTIVITY_INDICATOR_SIZE>;

  /** A string of text to render below the spinner */
  text?: string;

  /** Custom styles to render the text with */
  textStyles?: StyleProp<ViewStyle>;
};

function FlexibleLoadingIndicator({
  style,
  size,
  text,
  textStyles,
}: FlexibleLoadingIndicatorProps) {
  const theme = useTheme();
  const styles = useThemeStyles();

  return (
    <>
      <ActivityIndicator
        color={theme.spinner}
        style={[style]}
        size={size || CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
      />
      {text && (
        <Text
          style={[
            styles.textNormalThemeText,
            styles.alignSelfCenter,
            styles.mt3,
          ]}>
          {text}
        </Text>
      )}
    </>
  );
}

FlexibleLoadingIndicator.displayName = 'FlexibleLoadingIndicator';

export default FlexibleLoadingIndicator;
