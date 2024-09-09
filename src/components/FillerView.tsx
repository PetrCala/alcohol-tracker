import {View} from 'react-native';

type FillerViewProps = {
  height?: number;
};
const FillerView = ({height}: FillerViewProps) => {
  const fillerHeight = height ? height : 200;
  return <View style={{height: fillerHeight, backgroundColor: '#ffff99'}} />;
};

export default FillerView;
