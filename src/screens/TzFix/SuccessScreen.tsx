import {TzFixModalNavigatorParamList} from '@libs/Navigation/types';
import {StackScreenProps} from '@react-navigation/stack';
import SCREENS from '@src/SCREENS';

type SuccessScreenProps = StackScreenProps<
  TzFixModalNavigatorParamList,
  typeof SCREENS.TZ_FIX.SUCCESS
>;

function SuccessScreen({}: SuccessScreenProps) {
  return <></>;
}

export default SuccessScreen;
