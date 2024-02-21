import type {StackScreenProps} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
// import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ModalNavigatorScreenOptions from '@navigation/AppNavigator/ModalNavigatorScreenOptions';
import * as ModalStackNavigators from '@navigation/AppNavigator/ModalStackNavigators';
import type {
  AuthScreensParamList,
  RightModalNavigatorParamList,
} from '@navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
// import Overlay from './Overlay';

type RightModalNavigatorProps = StackScreenProps<
  AuthScreensParamList,
  typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR
>;

const Stack = createStackNavigator<RightModalNavigatorParamList>();

function RightModalNavigator({navigation}: RightModalNavigatorProps) {
  const styles = useThemeStyles();
  const {isSmallScreenWidth} = useWindowDimensions();
  const screenOptions = useMemo(
    () => ModalNavigatorScreenOptions(styles),
    [styles],
  );
  const isExecutingRef = useRef<boolean>(false);

  return (
    // <NoDropZone>
    // <View style={styles.RHPNavigatorContainer(isSmallScreenWidth)}>
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.ACHIEVEMENTS}
        component={ModalStackNavigators.AchievementsModalStackNavigator}
      />
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.DAY_OVERVIEW}
        component={ModalStackNavigators.DayOverviewModalStackNavigator}
      />
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.DRINKING_SESSION}
        component={ModalStackNavigators.DrinkingSessionModalStackNavigator}
      />
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.MAIN_MENU}
        component={ModalStackNavigators.MainMenuModalStackNavigator}
      />
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.PROFILE}
        component={ModalStackNavigators.ProfileModalStackNavigator}
      />
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.SETTINGS}
        component={ModalStackNavigators.SettingsModalStackNavigator}
      />
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.SOCIAL}
        component={ModalStackNavigators.SocialModalStackNavigator}
      />
      <Stack.Screen
        name={SCREENS.RIGHT_MODAL.STATISTICS}
        component={ModalStackNavigators.StatisticsModalStackNavigator}
      />
    </Stack.Navigator>
    // </View>
  );
}
{
  /* </NoDropZone> */
}

RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
