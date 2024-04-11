/* eslint-disable @typescript-eslint/naming-convention */
import type {LineLayerStyleProps} from '@rnmapbox/maps/src/utils/MapboxStyles';
import lodashClamp from 'lodash/clamp';
import type {LineLayer} from 'react-map-gl';
import type {
  AnimatableNumericValue,
  Animated,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type {PickerStyle} from 'react-native-picker-select';
import {StyleSheet} from 'react-native';
import type {CustomAnimation} from 'react-native-animatable';
import type {
  MixedStyleDeclaration,
  MixedStyleRecord,
} from 'react-native-render-html';
import CONST from '@src/CONST';
import {defaultTheme} from './theme';
import colors from './theme/colors';
import type {ThemeColors} from './theme/types';
// import addOutlineWidth from './utils/addOutlineWidth';
import borders from './utils/borders';
// import codeStyles from './utils/codeStyles';
// import cursor from './utils/cursor';
import display from './utils/display';
// import editedLabelStyles from './utils/editedLabelStyles';
import flex from './utils/flex';
// import FontUtils from './utils/FontUtils';
// import getPopOverVerticalOffset from './utils/getPopOverVerticalOffset';
// import objectFit from './utils/objectFit';
// import optionAlternateTextPlatformStyles from './utils/optionAlternateTextPlatformStyles';
import overflow from './utils/overflow';
import pointerEventsAuto from './utils/pointerEventsAuto';
import pointerEventsBoxNone from './utils/pointerEventsBoxNone';
import pointerEventsNone from './utils/pointerEventsNone';
import positioning from './utils/positioning';
import sizing from './utils/sizing';
import spacing from './utils/spacing';
import addOutlineWidth from './utils/addOutlineWidth';
import FontUtils from './utils/FontUtils';
// import textDecorationLine from './utils/textDecorationLine';
// import textUnderline from './utils/textUnderline';
// import userSelect from './utils/userSelect';
// import visibility from './utils/visibility';
// import whiteSpace from './utils/whiteSpace';
// import wordBreak from './utils/wordBreak';
// import writingDirection from './utils/writingDirection';
import variables from './variables';

type ColorScheme = (typeof CONST.COLOR_SCHEME)[keyof typeof CONST.COLOR_SCHEME];
type StatusBarStyle =
  (typeof CONST.STATUS_BAR_STYLE)[keyof typeof CONST.STATUS_BAR_STYLE];

type AnchorDimensions = {
  width: number;
  height: number;
};

type AnchorPosition = {
  horizontal: number;
  vertical: number;
};

type WebViewStyle = {
  tagStyles: MixedStyleRecord;
  baseFontStyle: MixedStyleDeclaration;
};

type CustomPickerStyle = PickerStyle & {icon?: ViewStyle};

type OverlayStylesParams = {
  progress: Animated.AnimatedInterpolation<string | number>;
};

type TwoFactorAuthCodesBoxParams = {
  isExtraSmallScreenWidth: boolean;
  isSmallScreenWidth: boolean;
};

type Translation =
  | 'perspective'
  | 'rotate'
  | 'rotateX'
  | 'rotateY'
  | 'rotateZ'
  | 'scale'
  | 'scaleX'
  | 'scaleY'
  | 'translateX'
  | 'translateY'
  | 'skewX'
  | 'skewY'
  | 'matrix';

type OfflineFeedbackStyle = Record<
  | 'deleted'
  | 'pending'
  | 'error'
  | 'container'
  | 'textContainer'
  | 'text'
  | 'errorDot',
  ViewStyle | TextStyle
>;

type MapDirectionStyle = Pick<LineLayerStyleProps, 'lineColor' | 'lineWidth'>;

type MapDirectionLayerStyle = Pick<LineLayer, 'layout' | 'paint'>;

type Styles = Record<
  string,
  | ViewStyle
  | TextStyle
  | ImageStyle
  | WebViewStyle
  | OfflineFeedbackStyle
  | MapDirectionStyle
  | MapDirectionLayerStyle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((
      ...args: any[]
    ) =>
      | ViewStyle
      | TextStyle
      | ImageStyle
      | AnchorPosition
      | CustomAnimation
      | CustomPickerStyle)
>;

const picker = (theme: ThemeColors) =>
  ({
    backgroundColor: theme.transparent,
    color: theme.text,
    fontFamily: FontUtils.fontFamily.platform.EXP_NEUE,
    fontSize: variables.fontSizeNormal,
    lineHeight: variables.fontSizeNormalHeight,
    paddingBottom: 8,
    paddingTop: 23,
    paddingLeft: 0,
    paddingRight: 25,
    height: variables.inputHeight,
    borderWidth: 0,
    textAlign: 'left',
  }) satisfies TextStyle;

const link = (theme: ThemeColors) =>
  ({
    color: theme.link,
    textDecorationColor: theme.link,
    fontFamily: FontUtils.fontFamily.platform.EXP_NEUE,
  }) satisfies ViewStyle & MixedStyleDeclaration;

const baseCodeTagStyles = (theme: ThemeColors) =>
  ({
    borderWidth: 1,
    borderRadius: 5,
    borderColor: theme.border,
    backgroundColor: theme.textBackground,
  }) satisfies ViewStyle & MixedStyleDeclaration;

const headlineFont = {
  fontFamily: FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
  fontWeight: '500',
} satisfies TextStyle;

const modalNavigatorContainer = (isSmallScreenWidth: boolean) =>
  ({
    position: 'absolute',
    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
    height: '100%',
  }) satisfies ViewStyle;

const styles = (theme: ThemeColors) =>
  ({
    // Add all of our utility and helper styles
    ...spacing,
    ...borders,
    ...sizing,
    ...flex,
    ...display,
    ...overflow,
    ...positioning,
    // ...wordBreak,
    // ...whiteSpace,
    // ...writingDirection,
    // ...cursor,
    // ...userSelect,
    // ...textUnderline,
    // ...objectFit,
    // ...textDecorationLine,
    // editedLabelStyles,

    borderTop: {
      borderTopWidth: variables.borderTopWidth,
      borderColor: theme.border,
    },

    borderTopRounded: {
      borderTopWidth: 1,
      borderColor: theme.border,
      borderTopLeftRadius: variables.componentBorderRadiusNormal,
      borderTopRightRadius: variables.componentBorderRadiusNormal,
    },

    borderBottomRounded: {
      borderBottomWidth: 1,
      borderColor: theme.border,
      borderBottomLeftRadius: variables.componentBorderRadiusNormal,
      borderBottomRightRadius: variables.componentBorderRadiusNormal,
    },

    borderBottom: {
      borderBottomWidth: 1,
      borderColor: theme.border,
    },

    borderNone: {
      borderWidth: 0,
      borderBottomWidth: 0,
    },

    borderRight: {
      borderRightWidth: 1,
      borderColor: theme.border,
    },

    borderLeft: {
      borderLeftWidth: 1,
      borderColor: theme.border,
    },

    bottomTabBarContainer: {
      flexDirection: 'row',
      height: variables.bottomTabHeight,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      // backgroundColor: theme.appBG,
      backgroundColor: colors.white,
    },

    button: {
      backgroundColor: theme.buttonDefaultBG,
      borderRadius: variables.buttonBorderRadius,
      minHeight: variables.componentSizeNormal,
      justifyContent: 'center',
      alignItems: 'center',
      ...spacing.ph3,
      ...spacing.pv0,
    },

    buttonContainer: {
      padding: 1,
      borderRadius: variables.buttonBorderRadius,
    },

    buttonText: {
      color: theme.text,
      fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
      fontSize: variables.fontSizeNormal,
      fontWeight: FontUtils.fontWeight.bold,
      textAlign: 'center',
      flexShrink: 1,

      // It is needed to unset the Lineheight. We don't need it for buttons as button always contains single line of text.
      // It allows to vertically center the text.
      lineHeight: undefined,

      // Add 1px to the Button text to give optical vertical alignment.
      paddingBottom: 1,
    },

    buttonSmall: {
      borderRadius: variables.buttonBorderRadius,
      minHeight: variables.componentSizeSmall,
      minWidth: variables.componentSizeSmall,
      paddingHorizontal: 12,
      backgroundColor: theme.buttonDefaultBG,
    },

    buttonMedium: {
      borderRadius: variables.buttonBorderRadius,
      minHeight: variables.componentSizeNormal,
      minWidth: variables.componentSizeNormal,
      paddingHorizontal: 16,
      backgroundColor: theme.buttonDefaultBG,
    },

    buttonLarge: {
      borderRadius: variables.buttonBorderRadius,
      minHeight: variables.componentSizeLarge,
      minWidth: variables.componentSizeLarge,
      paddingHorizontal: 20,
      backgroundColor: theme.buttonDefaultBG,
    },

    buttonSmallText: {
      fontSize: variables.fontSizeSmall,
      fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
      fontWeight: FontUtils.fontWeight.bold,
      textAlign: 'center',
    },

    buttonMediumText: {
      fontSize: variables.fontSizeLabel,
      fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
      fontWeight: FontUtils.fontWeight.bold,
      textAlign: 'center',
    },

    buttonLargeText: {
      fontSize: variables.fontSizeNormal,
      fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
      fontWeight: FontUtils.fontWeight.bold,
      textAlign: 'center',
    },

    buttonDefaultHovered: {
      backgroundColor: theme.buttonHoveredBG,
      borderWidth: 0,
    },

    buttonSuccess: {
      backgroundColor: theme.success,
      borderWidth: 0,
    },

    buttonOpacityDisabled: {
      opacity: 0.5,
    },

    buttonSuccessHovered: {
      backgroundColor: theme.successHover,
      borderWidth: 0,
    },

    buttonDanger: {
      backgroundColor: theme.danger,
      borderWidth: 0,
    },

    buttonDangerHovered: {
      backgroundColor: theme.dangerHover,
      borderWidth: 0,
    },

    buttonDisabled: {
      backgroundColor: theme.buttonDefaultBG,
      borderWidth: 0,
    },

    buttonDivider: {
      borderRightWidth: 1,
      borderRightColor: theme.buttonHoveredBG,
      ...sizing.h100,
    },

    buttonSuccessDivider: {
      borderRightWidth: 1,
      borderRightColor: theme.successHover,
      ...sizing.h100,
    },

    buttonDangerDivider: {
      borderRightWidth: 1,
      borderRightColor: theme.dangerHover,
      ...sizing.h100,
    },

    emptyAvatar: {
      height: variables.avatarSizeNormal,
      width: variables.avatarSizeNormal,
    },

    emptyAvatarSmallNormal: {
      height: variables.avatarSizeSmallNormal,
      width: variables.avatarSizeSmallNormal,
    },

    emptyAvatarSmall: {
      height: variables.avatarSizeSmall,
      width: variables.avatarSizeSmall,
    },

    emptyAvatarSmaller: {
      height: variables.avatarSizeSmaller,
      width: variables.avatarSizeSmaller,
    },

    emptyAvatarMedium: {
      height: variables.avatarSizeMedium,
      width: variables.avatarSizeMedium,
    },

    emptyAvatarLarge: {
      height: variables.avatarSizeLarge,
      width: variables.avatarSizeLarge,
    },

    emptyAvatarMargin: {
      marginRight: variables.avatarChatSpacing,
    },

    emptyAvatarMarginChat: {
      marginRight: variables.avatarChatSpacing - 12,
    },

    emptyAvatarMarginSmall: {
      marginRight: variables.avatarChatSpacing - 4,
    },

    emptyAvatarMarginSmaller: {
      marginRight: variables.avatarChatSpacing - 4,
    },

    formHelp: {
      color: theme.textSupporting,
      fontSize: variables.fontSizeLabel,
      lineHeight: variables.lineHeightLarge,
      marginBottom: 4,
    },

    formError: {
      color: theme.textError,
      fontSize: variables.fontSizeLabel,
      lineHeight: variables.formErrorLineHeight,
      marginBottom: 4,
    },

    formSuccess: {
      color: theme.success,
      fontSize: variables.fontSizeLabel,
      lineHeight: 18,
      marginBottom: 4,
    },

    noBorderRadius: {
      borderRadius: 0,
    },

    noRightBorderRadius: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },

    noLeftBorderRadius: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },

    buttonConfirmText: {
      paddingLeft: 20,
      paddingRight: 20,
    },

    buttonSuccessText: {
      color: theme.textLight,
    },

    buttonDangerText: {
      color: theme.textLight,
    },

    hoveredComponentBG: {
      backgroundColor: theme.hoverComponentBG,
    },

    activeComponentBG: {
      backgroundColor: theme.activeComponentBG,
    },

    colorSchemeStyle: (colorScheme: ColorScheme) => ({colorScheme}),

    headerGap: {
      // height: CONST.DESKTOP_HEADER_PADDING,
      height: 0,
    },

    iPhoneXSafeArea: {
      backgroundColor: theme.inverse,
      flex: 1,
    },

    navigationScreenCardStyle: {
      // backgroundColor: theme.appBG,
      backgroundColor: theme.white,
      height: '100%',
    },

    // noSelect: {
    //   boxShadow: 'none', // TODO check this
    //   outlineStyle: 'none',
    // },

    opacity0: {
      opacity: 0,
    },

    opacitySemiTransparent: {
      opacity: 0.5,
    },

    opacity1: {
      opacity: 1,
    },

    pointerEventsNone,

    pointerEventsAuto,

    pointerEventsBoxNone,

    rootNavigatorContainerStyles: (isSmallScreenWidth: boolean) =>
      ({
        marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWidth,
        flex: 1,
      }) satisfies ViewStyle,

    RHPNavigatorContainerNavigatorContainerStyles: (
      isSmallScreenWidth: boolean,
    ) =>
      ({
        marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWidth,
        flex: 1,
      }) satisfies ViewStyle,

    splashScreenHider: {
      backgroundColor: theme.splashBG,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Be extremely careful when editing the compose styles, as it is easy to introduce regressions.
    textInputCompose: addOutlineWidth(
      theme,
      {
        backgroundColor: theme.componentBG,
        borderColor: theme.border,
        color: theme.text,
        fontFamily: FontUtils.fontFamily.platform.SYSTEM,
        fontSize: variables.fontSizeNormal,
        borderWidth: 0,
        height: 'auto',
        lineHeight: variables.lineHeightXLarge,
        ...overflow,

        // On Android, multiline TextInput with height: 'auto' will show extra padding unless they are configured with
        // paddingVertical: 0, alignSelf: 'center', and verticalAlign: 'middle'

        paddingHorizontal: variables.avatarChatSpacing,
        paddingTop: 0,
        paddingBottom: 0,
        alignSelf: 'center',
        verticalAlign: 'middle',
      },
      0,
    ),

    textInputFullCompose: {
      alignSelf: 'stretch',
      flex: 1,
      maxHeight: '100%',
      verticalAlign: 'top',
    },

    textInputCollapseCompose: {
      maxHeight: '100%',
      flex: 4,
    },

    // composer padding should not be modified unless thoroughly tested against the cases in this PR: #12669
    textInputComposeSpacing: {
      paddingVertical: 5,
      ...flex.flexRow,
      flex: 1,
    },

    textInputComposeBorder: {
      borderLeftWidth: 1,
      borderColor: theme.border,
    },

    textAlignCenter: {
      textAlign: 'center',
    },

    textAlignRight: {
      textAlign: 'right',
    },

    textAlignLeft: {
      textAlign: 'left',
    },

    verticalAlignTop: {
      verticalAlign: 'top',
    },

    label: {
      fontSize: variables.fontSizeLabel,
      lineHeight: variables.lineHeightLarge,
    },
  }) satisfies Styles;

type ThemeStyles = ReturnType<typeof styles>;

const defaultStyles = styles(defaultTheme);

export default styles;
export {defaultStyles};
export type {
  Styles,
  ThemeStyles,
  StatusBarStyle,
  ColorScheme,
  AnchorPosition,
  AnchorDimensions,
};
