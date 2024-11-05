import useTheme from '@hooks/useTheme';
import {StyleProp, View, ViewStyle} from 'react-native';

type FillerViewProps = {
  styles?: StyleProp<ViewStyle>;
  height?: number;
};
const FillerView = ({height, styles}: FillerViewProps) => {
  const fillerHeight = height ? height : 200;
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
};

export default FillerView;
