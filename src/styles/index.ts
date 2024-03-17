/* eslint-disable @typescript-eslint/naming-convention */
// import type {LineLayerStyleProps} from '@rnmapbox/maps/src/utils/MapboxStyles';
import lodashClamp from 'lodash/clamp';
import type {LineLayer} from 'react-map-gl';
import type {
  AnimatableNumericValue,
  Animated,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
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
// import pointerEventsAuto from './utils/pointerEventsAuto';
// import pointerEventsBoxNone from './utils/pointerEventsBoxNone';
// import pointerEventsNone from './utils/pointerEventsNone';
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

type AnchorPosition = {
  horizontal: number;
  vertical: number;
};

type Styles = Record<
  string,
  | ViewStyle
  | TextStyle
  | ImageStyle
  //   | WebViewStyle
  //   | OfflineFeedbackStyle
  //   | MapDirectionStyle
  //   | MapDirectionLayerStyle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((
      ...args: any[]
    ) => ViewStyle | TextStyle | ImageStyle | AnchorPosition | CustomAnimation)
>;

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
  }) satisfies Styles;

type ThemeStyles = ReturnType<typeof styles>;

const defaultStyles = styles(defaultTheme);

export default styles;
export {defaultStyles};
export type {Styles, ThemeStyles, StatusBarStyle, ColorScheme, AnchorPosition};
