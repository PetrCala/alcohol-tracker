import {createStackNavigator} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import hasCompletedGuidedSetupFlowSelector from '@libs/hasCompletedGuidedSetupFlowSelector';
import TzFixModalNavigatorScreenOptions from '@libs/Navigation/getTzFixModalScreenOptions';
import Navigation from '@libs/Navigation/Navigation';
import type {TzFixModalNavigatorParamList} from '@libs/Navigation/types';
import OnboardingRefManager from '@libs/OnboardingRefManager';
import IntroductionScreen from '@screens/TzFix/IntroductionScreen';
import DetectionScreen from '@screens/TzFix/DetectionScreen';
import ConfirmationScreen from '@screens/TzFix/ConfirmationScreen';
import SuccessScreen from '@screens/TzFix/SuccessScreen';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import useStyleUtils from '@hooks/useStyleUtils';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import SelectionScreen from '@screens/TzFix/SelectionScreen';
import Overlay from './Overlay';

const Stack = createStackNavigator<TzFixModalNavigatorParamList>();

function TzFixModalNavigator() {
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {isMediumOrLargerScreenWidth} = useOnboardingLayout();
  const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_TZ_FIX, {
    selector: hasCompletedGuidedSetupFlowSelector,
  });
  const {shouldUseNarrowLayout} = useResponsiveLayout();

  useEffect(() => {
    if (!hasCompletedGuidedSetupFlow) {
      return;
    }
    Navigation.isNavigationReady().then(() => {
      // On small screens, pop all navigation states and go back to HOME.
      // On large screens, need to go back to previous route and then redirect to Concierge,
      // otherwise going back on Concierge will go to onboarding and then redirected to Concierge again
      if (shouldUseNarrowLayout) {
        Navigation.setShouldPopAllStateOnUP(true);
        Navigation.goBack(ROUTES.HOME, true, true);
      } else {
        Navigation.goBack();
      }
    });
  }, [hasCompletedGuidedSetupFlow, shouldUseNarrowLayout]);

  const outerViewRef = React.useRef<View>(null);

  const handleOuterClick = useCallback(() => {
    OnboardingRefManager.handleOuterClick();
  }, []);

  useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleOuterClick, {
    shouldBubble: true,
  });

  if (hasCompletedGuidedSetupFlow) {
    return null;
  }
  return (
    <>
      <Overlay />
      <View
        ref={outerViewRef}
        onClick={handleOuterClick}
        style={styles.onboardingNavigatorOuterView}>
        <FocusTrapForScreens>
          <View
            onClick={e => e.stopPropagation()}
            style={styles.OnboardingNavigatorInnerView(
              isMediumOrLargerScreenWidth,
            )}>
            <Stack.Navigator
              screenOptions={TzFixModalNavigatorScreenOptions(
                shouldUseNarrowLayout,
                styles,
                StyleUtils,
              )}>
              <Stack.Screen
                name={SCREENS.TZ_FIX.INTRODUCTION}
                component={IntroductionScreen}
              />
              <Stack.Screen
                name={SCREENS.TZ_FIX.DETECTION}
                component={DetectionScreen}
              />
              <Stack.Screen
                name={SCREENS.TZ_FIX.SELECTION}
                component={SelectionScreen}
              />
              <Stack.Screen
                name={SCREENS.TZ_FIX.CONFIRMATION}
                component={ConfirmationScreen}
              />
              <Stack.Screen
                name={SCREENS.TZ_FIX.SUCCESS}
                component={SuccessScreen}
              />
            </Stack.Navigator>
          </View>
        </FocusTrapForScreens>
      </View>
    </>
  );
}

TzFixModalNavigator.displayName = 'TzFixModalNavigator';

export default TzFixModalNavigator;
