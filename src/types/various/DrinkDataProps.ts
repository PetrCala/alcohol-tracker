import {DrinkKey} from '@src/types/database';
import {ImageSourcePropType} from 'react-native';

type DrinkDataProps = {
  key: DrinkKey;
  icon: ImageSourcePropType;
}[];

export default DrinkDataProps;
