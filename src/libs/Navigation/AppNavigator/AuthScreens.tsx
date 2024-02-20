import {SafeAreaView, StyleSheet, View} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {DatabaseDataProvider} from '@context/global/DatabaseDataContext';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthScreensParamList} from '../types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import CentralPaneNavigator from './Navigators/CentralPaneNavigator';
import FullScreenNavigator from './Navigators/FullScreenNavigator';
import LeftModalNavigator from './Navigators/LeftModalNavigator';
import {useRef} from 'react';
import getRootNavigatorScreenOptions from './getRootNavigatorScreenOptions';
import useWindowDimensions from '@hooks/useWindowDimensions';
import BottomTabNavigator from './Navigators/BottomTabNavigator';
import RightModalNavigator from './Navigators/RightModalNavigator';
import NotFoundScreen from '@screens/ErrorScreen/NotFoundScreen';
import createCustomStackNavigator from './createCustomStackNavigator';
import CONST from '@src/CONST';

const RootStack = createCustomStackNavigator<AuthScreensParamList>();

// const modalScreenListeners = {
//   focus: () => {
//     Modal.setModalVisibility(true);
//   },
//   beforeRemove: () => {
//     // Clear search input (WorkspaceInvitePage) when modal is closed
//     SearchInputManager.searchInput = '';
//     Modal.setModalVisibility(false);
//   },
// };

function AuthScreens() {
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {isSmallScreenWidth} = useWindowDimensions();
  console.log('style utils', StyleUtils);
  const screenOptions = getRootNavigatorScreenOptions(
    isSmallScreenWidth,
    styles,
    StyleUtils,
  );
  const isInitialRender = useRef(true);
  // const insets = useSafeAreaInsets(); // For old safe-area

  if (isInitialRender.current) {
    // Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
    isInitialRender.current = false;
  }

  // More cools things here - see the original lib

  return (
    // Use the safe area provider from the source lib, if traceable
    // <SafeAreaProvider
    //   style={[
    //     styles.safeArea,
    //     {
    //       paddingTop: insets.top,
    //       paddingLeft: insets.left,
    //       paddingRight: insets.right,
    //       paddingBottom: insets.bottom,
    //     },
    //   ]}>
    <DatabaseDataProvider>
      <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
        <RootStack.Navigator isSmallScreenWidth={isSmallScreenWidth}>
          <RootStack.Screen
            name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
            options={screenOptions.bottomTab}
            component={BottomTabNavigator}
          />
          {/* <RootStack.Screen
          name={NAVIGATORS.CENTRAL_PANE_NAVIGATOR}
          options={screenOptions.centralPaneNavigator}
          component={CentralPaneNavigator}
        /> */}
          <RootStack.Screen
            name={SCREENS.NOT_FOUND}
            options={screenOptions.fullScreen}
            component={NotFoundScreen}
          />
          {/* <RootStack.Screen
          name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
          options={screenOptions.rightModalNavigator}
          component={RightModalNavigator}
          // listeners={modalScreenListeners} // For modal screen listeners
        /> */}
          {/* <RootStack.Screen
          name={NAVIGATORS.FULL_SCREEN_NAVIGATOR}
          options={screenOptions.fullScreen}
          component={FullScreenNavigator}
        /> */}
          {/* <RootStack.Screen
          name={NAVIGATORS.LEFT_MODAL_NAVIGATOR}
          options={screenOptions.leftModalNavigator}
          component={LeftModalNavigator}
          listeners={modalScreenListeners}
        /> */}
          {/* <RootStack.Screen
          name={SCREENS.DESKTOP_SIGN_IN_REDIRECT}
          options={screenOptions.fullScreen}
          component={DesktopSignInRedirectPage}
        /> */}
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
        </RootStack.Navigator>
      </View>
    </DatabaseDataProvider>
  );
}
{
  /* // </SafeAreaProvider> */
}

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//     // ...
//   },
// });

export default AuthScreens;
