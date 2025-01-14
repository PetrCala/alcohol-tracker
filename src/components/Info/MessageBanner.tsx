import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';

type MessageBannerProps = {
  text: string;
  onPress: () => void;
  danger?: boolean;
  success?: boolean;
};
function MessageBanner({text, onPress, danger, success}: MessageBannerProps) {
  const styles = useThemeStyles();
  const theme = useTheme();
  const {translate} = useLocalize();

  return (
    <PressableWithFeedback
      accessibilityLabel={translate('homeScreen.currentlyInSessionButton')}
      style={[
        styles.messageBanner,
        danger && styles.buttonDanger,
        success && styles.buttonSuccess,
      ]}
      onPress={onPress}>
      <Text style={[styles.buttonHugeText, {color: theme.textLight}]}>
        {text}
      </Text>
    </PressableWithFeedback>
  );
}

export default MessageBanner;
