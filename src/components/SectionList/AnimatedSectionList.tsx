import {SectionList as RNSectionList} from 'react-native';
import Animated from 'react-native-reanimated';
import type {SectionListProps} from './types';

const AnimatedSectionList =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Animated.createAnimatedComponent<SectionListProps<any, any>>(RNSectionList);

export default AnimatedSectionList;
