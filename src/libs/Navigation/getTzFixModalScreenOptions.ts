import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';
import getRootNavigatorScreenOptions from './AppNavigator/getRootNavigatorScreenOptions';

function getOnboardingModalScreenOptions(
  isSmallScreenWidth: boolean,
  styles: ThemeStyles,
  StyleUtils: StyleUtilsType,
) {
  return {
    ...getRootNavigatorScreenOptions(isSmallScreenWidth, styles, StyleUtils)
      .fullScreen,
    gestureEnabled: false,
  };
}

export default getOnboardingModalScreenOptions;
