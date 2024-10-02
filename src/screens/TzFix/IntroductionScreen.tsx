import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {TzFixModalNavigatorParamList} from '@libs/Navigation/types';
import {StackScreenProps} from '@react-navigation/stack';
import SCREENS from '@src/SCREENS';
import {View} from 'react-native';

type IntroductionScreenProps = StackScreenProps<
  TzFixModalNavigatorParamList,
  typeof SCREENS.TZ_FIX.INTRODUCTION
>;

function IntroductionScreen({}: IntroductionScreenProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  const onConfirm = () => {};

  return (
    <ScreenWrapper testID={IntroductionScreen.displayName}>
      <HeaderWithBackButton
        shouldShowBackButton={false}
        progressBarPercentage={25}
      />
      <View style={[styles.m5, styles.flexGrow1]}>
        <Button
          success
          style={styles.mt4}
          onPress={onConfirm}
          pressOnEnter
          large
          text={translate('common.continue')}
        />
      </View>
    </ScreenWrapper>
  );
}

IntroductionScreen.displayName = 'IntroductionScreen';

export default IntroductionScreen;
