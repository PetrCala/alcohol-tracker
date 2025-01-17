import type {NavigationContainerRef} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import Log from '@libs/Log';
import type {RootStackParamList} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Dismisses the last modal stack if there is any
 *
 * @param targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissModal(
  navigationRef: NavigationContainerRef<RootStackParamList>,
) {
  if (!navigationRef.isReady()) {
    return;
  }

  const state = navigationRef.getState();
  const lastRoute = state.routes[state.routes.length - 1];
  switch (lastRoute?.name) {
    // case NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR:
    case NAVIGATORS.FULL_SCREEN_NAVIGATOR:
    case NAVIGATORS.LEFT_MODAL_NAVIGATOR:
    case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
    case SCREENS.NOT_FOUND:
      navigationRef.dispatch({...StackActions.pop(), target: state.key});
      break;
    default: {
      Log.hmmm(
        '[Navigation] dismissModal failed because there is no modal stack to dismiss',
      );
    }
  }
}

export default dismissModal;
