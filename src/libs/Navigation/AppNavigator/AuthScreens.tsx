import {View} from 'react-native';
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
    // Here, it would be possible to use the old safe-area
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
          <RootStack.Screen
            name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
            options={screenOptions.rightModalNavigator}
            component={RightModalNavigator}
            // listeners={modalScreenListeners} // For modal screen listeners
          />
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
        </RootStack.Navigator>
      </View>
    </DatabaseDataProvider>
  );
}
{
  /* // </SafeAreaProvider> */
}

export default AuthScreens;
