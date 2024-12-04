import useTheme from '@hooks/useTheme';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';

type FillerViewProps = {
  styles?: StyleProp<ViewStyle>;
  height?: number;
};
function FillerView({height, styles}: FillerViewProps) {
  const fillerHeight = height || 200;
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: fillerHeight,
          backgroundColor: theme.appBG,
        },
        styles,
      ]}
    />
  );
}

export default FillerView;
