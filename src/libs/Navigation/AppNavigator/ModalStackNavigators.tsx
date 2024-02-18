import type {ParamListBase} from '@react-navigation/routers';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
// import type {
//   MoneyRequestNavigatorParamList,
//   SettingsNavigatorParamList,
//   SignInNavigatorParamList,
// } from '@navigation/types';
import type {ThemeStyles} from '@styles/index';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';

type Screens = Partial<Record<Screen, () => React.ComponentType>>;

/**
 * Create a modal stack navigator with an array of sub-screens.
 *
 * @param screens key/value pairs where the key is the name of the screen and the value is a functon that returns the lazy-loaded component
 * @param getScreenOptions optional function that returns the screen options, override the default options
 */
function createModalStackNavigator<TStackParams extends ParamListBase>(
  screens: Screens,
  getScreenOptions?: (styles: ThemeStyles) => StackNavigationOptions,
): React.ComponentType {
  const ModalStackNavigator = createStackNavigator<TStackParams>();

  function ModalStack() {
    const styles = useThemeStyles();

    const defaultSubRouteOptions = useMemo(
      (): StackNavigationOptions => ({
        cardStyle: styles.navigationScreenCardStyle,
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
      [styles],
    );

    return (
      <ModalStackNavigator.Navigator
        screenOptions={getScreenOptions?.(styles) ?? defaultSubRouteOptions}>
        {Object.keys(screens as Required<Screens>).map(name => (
          <ModalStackNavigator.Screen
            key={name}
            name={name}
            getComponent={(screens as Required<Screens>)[name as Screen]}
          />
        ))}
      </ModalStackNavigator.Navigator>
    );
  }

  ModalStack.displayName = 'ModalStack';

  return ModalStack;
}

// const MoneyRequestModalStackNavigator =
//   createModalStackNavigator<MoneyRequestNavigatorParamList>({
//     [SCREENS.MONEY_REQUEST.START]: () =>
//       require('../../../pages/iou/request/IOURequestRedirectToStartPage')
//         .default as React.ComponentType,
//   });

// const SettingsModalStackNavigator =
//   createModalStackNavigator<SettingsNavigatorParamList>({
//     [SCREENS.SETTINGS.PROFILE.PRONOUNS]: () =>
//       require('../../../pages/settings/Profile/PronounsPage')
//         .default as React.ComponentType,
//     [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: () =>
//       require('../../../pages/settings/Profile/DisplayNamePage')
//         .default as React.ComponentType,
//   });

// const SignInModalStackNavigator =
//   createModalStackNavigator<SignInNavigatorParamList>({
//     [SCREENS.SIGN_IN_ROOT]: () =>
//       require('../../../pages/signin/SignInModal')
//         .default as React.ComponentType,
//   });

export //   MoneyRequestModalStackNavigator,
//   SettingsModalStackNavigator,
//   SignInModalStackNavigator,
 {};
