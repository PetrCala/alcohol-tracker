import {UnitKey} from '@src/types/database';
import {ImageSourcePropType} from 'react-native';

type DrinkDataProps = {
  key: UnitKey;
  icon: ImageSourcePropType;
  typeSum: number;
  setTypeSum: React.Dispatch<React.SetStateAction<number>>;
}[];

export default DrinkDataProps;
