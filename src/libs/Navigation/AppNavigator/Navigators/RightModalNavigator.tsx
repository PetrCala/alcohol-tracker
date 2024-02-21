import type {StackScreenProps} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
// import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import type {
  AuthScreensParamList,
  RightModalNavigatorParamList,
} from '@navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import MainMenuScreen from '@screens/MainMenuScreen';
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
        name={SCREENS.RIGHT_MODAL.MAIN_MENU}
        component={ModalStackNavigators.MainMenuModalStackNavigator}
      />
      {/* <RootStack.Screen name="Main Screen" component={MainScreen} />
          <RootStack.Screen name="Profile Screen" component={ProfileScreen} />
          <RootStack.Screen
            name="Main Menu Screen"
            component={MainMenuScreen}
          />
          <RootStack.Screen
            name="Drinking Session Screen"
            component={DrinkingSessionScreen}
          />
          <RootStack.Screen name="Social Screen" component={SocialScreen} />
          <RootStack.Screen
            name="Friends Friends Screen"
            component={FriendsFriendsScreen}
          />
          <RootStack.Screen
            name="Achievement Screen"
            component={AchievementScreen}
          />
          <RootStack.Screen
            name="Statistics Screen"
            component={StatisticsScreen}
          />
          <RootStack.Screen name="Settings Screen" component={SettingsScreen} />
          <RootStack.Screen
            name="Preferences Screen"
            component={PreferencesScreen}
          />
          <RootStack.Screen
            name="Day Overview Screen"
            component={DayOverviewScreen}
          />
          <RootStack.Screen
            name="Edit Session Screen"
            component={EditSessionScreen}
          />
          <RootStack.Screen
            name="Session Summary Screen"
            component={SessionSummaryScreen}
          />
          <RootStack.Screen
            name="Terms Of Service Screen"
            component={TermsOfServiceScreen}
          />
          <RootStack.Screen
            name="Privacy Policy Screen"
            component={PrivacyPolicyScreen}
          /> */}
      {/* <Stack.Screen
            name={SCREENS.RIGHT_MODAL.SETTINGS}
            component={ModalStackNavigators.SettingsModalStackNavigator}
          />
          <Stack.Screen
            name={SCREENS.RIGHT_MODAL.NEW_CHAT}
            component={ModalStackNavigators.NewChatModalStackNavigator}
          />
          <Stack.Screen
            name={SCREENS.RIGHT_MODAL.DETAILS}
            component={ModalStackNavigators.DetailsModalStackNavigator}
          />
          ... */}
    </Stack.Navigator>
    // </View>
  );
}
{
  /* </NoDropZone> */
}

RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
