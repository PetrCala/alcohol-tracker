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
import type {PickerStyle} from 'react-native-picker-select';
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
// import overflowXHidden from './utils/overflowXHidden';
// import pointerEventsAuto from './utils/pointerEventsAuto';
// import pointerEventsBoxNone from './utils/pointerEventsBoxNone';
// import pointerEventsNone from './utils/pointerEventsNone';
import positioning from './utils/positioning';
import sizing from './utils/sizing';
import spacing from './utils/spacing';
import variables from './variables';
// import textDecorationLine from './utils/textDecorationLine';
// import textUnderline from './utils/textUnderline';
// import userSelect from './utils/userSelect';
// import visibility from './utils/visibility';
// import whiteSpace from './utils/whiteSpace';
// import wordBreak from './utils/wordBreak';
// import writingDirection from './utils/writingDirection';
// import variables from './variables';

type ColorScheme = (typeof CONST.COLOR_SCHEME)[keyof typeof CONST.COLOR_SCHEME];
type StatusBarStyle =
  (typeof CONST.STATUS_BAR_STYLE)[keyof typeof CONST.STATUS_BAR_STYLE];

type AnchorPosition = {
  horizontal: number;
  vertical: number;
};

type CustomPickerStyle = PickerStyle & {icon?: ViewStyle};

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
    ) =>
      | ViewStyle
      | TextStyle
      | ImageStyle
      | AnchorPosition
      | CustomAnimation
      | CustomPickerStyle)
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
      backgroundColor: theme.appBG,
    },

    navigationScreenCardStyle: {
      backgroundColor: theme.appBG,
      height: '100%',
    },
  }) satisfies Styles;

type ThemeStyles = ReturnType<typeof styles>;

const defaultStyles = styles(defaultTheme);

export default styles;
export {defaultStyles};
export type {Styles, ThemeStyles, StatusBarStyle, ColorScheme, AnchorPosition};
