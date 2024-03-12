import type {ParamListBase} from '@react-navigation/routers';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ThemeStyles} from '@styles/index';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import {
  AchievementsNavigatorParamList,
  DayOverviewNavigatorParamList,
  DrinkingSessionNavigatorParamList,
  MainMenuNavigatorParamList,
} from '@navigation/types';

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

const AchievementsModalStackNavigator =
  createModalStackNavigator<AchievementsNavigatorParamList>({
    [SCREENS.ACHIEVEMENTS.ROOT]: () =>
      require('@screens/Achievements/AchievementsScreen')
        .default as React.ComponentType,
  });

const DayOverviewModalStackNavigator =
  createModalStackNavigator<DayOverviewNavigatorParamList>({
    [SCREENS.DAY_OVERVIEW.ROOT]: () =>
      require('@screens/DayOverview/DayOverviewScreen')
        .default as React.ComponentType,
  });

const DrinkingSessionModalStackNavigator =
  createModalStackNavigator<DrinkingSessionNavigatorParamList>({
    [SCREENS.DRINKING_SESSION.ROOT]: () =>
      require('@screens/DrinkingSession/DrinkingSessionScreen')
        .default as React.ComponentType,
    [SCREENS.DRINKING_SESSION.LIVE]: () =>
      require('@screens/DrinkingSession/LiveSessionScreen')
        .default as React.ComponentType,
    [SCREENS.DRINKING_SESSION.SUMMARY]: () =>
      require('@screens/DrinkingSession/SessionSummaryScreen')
        .default as React.ComponentType,
  });

const MainMenuModalStackNavigator =
  createModalStackNavigator<MainMenuNavigatorParamList>({
    [SCREENS.MAIN_MENU.ROOT]: () =>
      require('@screens/MainMenu/MainMenuScreen')
        .default as React.ComponentType,
    [SCREENS.MAIN_MENU.PREFERENCES]: () =>
      require('@screens/MainMenu/PreferencesScreen')
        .default as React.ComponentType,
  });

const ProfileModalStackNavigator =
  createModalStackNavigator<MainMenuNavigatorParamList>({
    [SCREENS.PROFILE.ROOT]: () =>
      require('@screens/Profile/ProfileScreen').default as React.ComponentType,
    [SCREENS.PROFILE.FRIENDS_FRIENDS]: () =>
      require('@screens/Profile/FriendsFriendsScreen')
        .default as React.ComponentType,
  });

const SettingsModalStackNavigator =
  createModalStackNavigator<MainMenuNavigatorParamList>({
    [SCREENS.SETTINGS.ROOT]: () =>
      require('@screens/Settings/SettingsScreen')
        .default as React.ComponentType,
  });

const SocialModalStackNavigator =
  createModalStackNavigator<MainMenuNavigatorParamList>({
    [SCREENS.SOCIAL.ROOT]: () =>
      require('@screens/Social/SocialScreen').default as React.ComponentType,
    [SCREENS.SOCIAL.FRIEND_LIST]: () =>
      require('@screens/Social/FriendListScreen')
        .default as React.ComponentType,
    [SCREENS.SOCIAL.FRIEND_REQUESTS]: () =>
      require('@screens/Social/FriendRequestScreen')
        .default as React.ComponentType,
    [SCREENS.SOCIAL.FRIEND_SEARCH]: () =>
      require('@screens/Social/FriendSearchScreen')
        .default as React.ComponentType,
  });

const StatisticsModalStackNavigator =
  createModalStackNavigator<MainMenuNavigatorParamList>({
    [SCREENS.STATISTICS.ROOT]: () =>
      require('@screens/Statistics/StatisticsScreen')
        .default as React.ComponentType,
  });

export {
  AchievementsModalStackNavigator,
  DayOverviewModalStackNavigator,
  DrinkingSessionModalStackNavigator,
  MainMenuModalStackNavigator,
  ProfileModalStackNavigator,
  SettingsModalStackNavigator,
  SocialModalStackNavigator,
  StatisticsModalStackNavigator,
};
