import {View} from 'react-native';

type FillerViewProps = {
  height?: number;
};
const FillerView = ({height}: FillerViewProps) => {
  let fillerHeight = height ? height : 200;
  return <View style={{height: fillerHeight, backgroundColor: '#ffff99'}} />;
};

export default FillerView;
