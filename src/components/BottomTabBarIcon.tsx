import CONST from '@src/CONST';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import type IconAsset from '@src/types/utils/IconAsset';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import variables from '@src/styles/variables';
import spacing from '@src/styles/utils/spacing';
import Icon from './Icon';
import Text from './Text';
import {PressableWithFeedback} from './Pressable';

type BottomTabBarIconProps = {
  /** The icon source */
  src: IconAsset;

  /** Accessibility label */
  accessibilityLabel: string;

  /** A callback to call on press of the button */
  onPress: () => void;

  /** The width of the icon. */
  width?: number;

  /** The height of the icon. */
  height?: number;

  /** Additional styles to add to the Icon */
  additionalStyles?: StyleProp<ViewStyle>;

  /** An optional counter to display above the icon */
  counter?: number;
};

function BottomTabBarIcon({
  src,
  accessibilityLabel,
  onPress,
  width,
  height,
  additionalStyles,
  counter,
}: BottomTabBarIconProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const theme = useTheme();

  // We want to offset the icon and the counter by the same amount
  const counterMarginLeft = styles.ml1;
  const translateX = variables.iconBottomBar / 2;
  const transformStyles: StyleProp<ViewStyle> = counter
    ? {transform: [{translateX}]}
    : null;

  return (
    // <Tooltip text={translate('common.search')}>
    <PressableWithFeedback
      onPress={onPress}
      role={CONST.ROLE.BUTTON}
      accessibilityLabel={accessibilityLabel}
      wrapperStyle={styles.flex1}
      style={[styles.bottomTabBarItem, styles.flexRow, additionalStyles]}>
      <View>
        <Icon
          src={src}
          fill={theme.iconDark}
          width={width ?? variables.iconBottomBar}
          height={height ?? variables.iconBottomBar}
          additionalStyles={transformStyles}
        />
      </View>
      {!!counter && counter > 0 && (
        <View
          style={[
            styles.bottomTabBarCounter,
            styles.mb4,
            counterMarginLeft,
            transformStyles,
          ]}>
          <Text style={styles.textWhite}>{counter}</Text>
        </View>
      )}
    </PressableWithFeedback>
    // </Tooltip>
  );
}

BottomTabBarIcon.displayName = 'bottomTabBarIcon';
export default BottomTabBarIcon;
