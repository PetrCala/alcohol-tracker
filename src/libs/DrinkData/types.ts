import type {DrinkKey} from '@src/types/onyx';
import type {ImageSourcePropType} from 'react-native';

type DrinkDataProps = Array<{
  key: DrinkKey;
  icon: ImageSourcePropType;
}>;

export default DrinkDataProps;
