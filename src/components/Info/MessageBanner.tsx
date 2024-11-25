import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import stylePropTypes from '@src/styles/stylePropTypes';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Text from '@components/Text';

type MessageBannerProps = {
  text: string;
  onPress: () => void;
  danger?: boolean;
  success?: boolean;
};

const MessageBanner: React.FC<MessageBannerProps> = ({
  text,
  onPress,
  danger,
  success,
}) => {
  const styles = useThemeStyles();
  const theme = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[
        styles.messageBanner,
        danger && styles.buttonDanger,
        success && styles.buttonSuccess,
      ]}
      onPress={onPress}>
      <Text style={[styles.buttonHugeText, {color: theme.textLight}]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default MessageBanner;
