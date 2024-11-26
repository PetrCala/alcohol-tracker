import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {AuthScreensParamList} from '@libs/Navigation/types';
import {StackScreenProps} from '@react-navigation/stack';
import SCREENS from '@src/SCREENS';

type VerifyEmailScreenOnyxProps = {};
type VerifyEmailScreenProps = VerifyEmailScreenOnyxProps &
  StackScreenProps<AuthScreensParamList, typeof SCREENS.VERIFY_EMAIL>;

function VerifyEmailScreen({route}: VerifyEmailScreenProps) {
  const styles = useThemeStyles();

  return (
    <ScreenWrapper
      testID={VerifyEmailScreen.displayName}
      style={styles.appContent}>
      <Text>Hello!</Text>
    </ScreenWrapper>
  );
}

VerifyEmailScreen.displayName = 'VerifyEmailScreen';
export default VerifyEmailScreen;
