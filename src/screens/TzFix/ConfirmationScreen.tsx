import {TzFixModalNavigatorParamList} from '@libs/Navigation/types';
import {StackScreenProps} from '@react-navigation/stack';
import SCREENS from '@src/SCREENS';

type ConfirmationScreenProps = StackScreenProps<
  TzFixModalNavigatorParamList,
  typeof SCREENS.TZ_FIX.CONFIRMATION
>;

function ConfirmationScreen({}: ConfirmationScreenProps) {
  return <></>;
}

export default ConfirmationScreen;
