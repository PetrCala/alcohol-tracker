import {StyleProp, View, ViewStyle} from 'react-native';

type FillerViewProps = {
  styles?: StyleProp<ViewStyle>;
  height?: number;
};
const FillerView = ({height, styles}: FillerViewProps) => {
  const fillerHeight = height ? height : 200;
  return (
    <View
      style={[
        {
          height: fillerHeight,
          backgroundColor: '#ffff99',
        },
        styles,
      ]}
    />
  );
};

export default FillerView;
