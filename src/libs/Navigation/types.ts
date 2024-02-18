/* eslint-disable @typescript-eslint/naming-convention  */
import type {
  CommonActions,
  NavigationContainerRefWithCurrent,
  NavigationHelpers,
  NavigationState,
  NavigatorScreenParams,
  ParamListBase,
  PartialRoute,
  PartialState,
  Route,
} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import type SCREENS from '@src/SCREENS';
import type {Route as Routes} from '@src/ROUTES';

type NavigationRef = NavigationContainerRefWithCurrent<RootStackParamList>;

type NavigationRoot = NavigationHelpers<RootStackParamList>;

type GoBackAction = Extract<CommonActions.Action, {type: 'GO_BACK'}>;
type ResetAction = Extract<CommonActions.Action, {type: 'RESET'}>;
type SetParamsAction = Extract<CommonActions.Action, {type: 'SET_PARAMS'}>;

type ActionNavigate = {
  type: ValueOf<typeof CONST.NAVIGATION.ACTION_TYPE>;
  payload: {
    name?: string;
    key?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any;
    path?: string;
    merge?: boolean;
  };
  source?: string;
  target?: string;
};

type StackNavigationAction =
  | GoBackAction
  | ResetAction
  | SetParamsAction
  | ActionNavigate
  | undefined;

type NavigationStateRoute = NavigationState['routes'][number];
type NavigationPartialRoute<TRouteName extends string = string> = PartialRoute<
  Route<TRouteName>
>;
type StateOrRoute =
  | NavigationState
  | NavigationStateRoute
  | NavigationPartialRoute;
type State<TParamList extends ParamListBase = ParamListBase> =
  | NavigationState<TParamList>
  | PartialState<NavigationState<TParamList>>;

type CentralPaneNavigatorParamList = {
  //   [SCREENS.REPORT]: {
  //     reportActionID: string;
  //     reportID: string;
  //     openOnAdminRoom?: boolean;
  //   };
  //   [SCREENS.SETTINGS.WORKSPACES]: undefined;
  //   [SCREENS.WORKSPACE.PROFILE]: {
  //     policyID: string;
  //   };
  //   [SCREENS.WORKSPACE.CARD]: {
  //     policyID: string;
  //   };
  //   [SCREENS.WORKSPACE.REIMBURSE]: {
  //     policyID: string;
  //   };
  //   [SCREENS.WORKSPACE.BILLS]: {
  //     policyID: string;
  //   };
  //   [SCREENS.WORKSPACE.INVOICES]: {
  //     policyID: string;
  //   };
  //   [SCREENS.WORKSPACE.TRAVEL]: {
  //     policyID: string;
  //   };
  //   [SCREENS.WORKSPACE.MEMBERS]: {
  //     policyID: string;
  //   };
};

type RightModalNavigatorParamList = {
  // [SCREENS.RIGHT_MODAL.SETTINGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
  // [SCREENS.RIGHT_MODAL.NEW_CHAT]: NavigatorScreenParams<NewChatNavigatorParamList>;
  // [SCREENS.RIGHT_MODAL.DETAILS]: NavigatorScreenParams<DetailsNavigatorParamList>;
};

type LeftModalNavigatorParamList = {
  // [SCREENS.LEFT_MODAL.SEARCH]: NavigatorScreenParams<SearchNavigatorParamList>;
  // [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: NavigatorScreenParams<WorkspaceSwitcherNavigatorParamList>;
};

type SettingsCentralPaneNavigatorParamList = {
  // [SCREENS.SETTINGS.SHARE_CODE]: undefined;
  // [SCREENS.SETTINGS.PROFILE.ROOT]: undefined;
  // [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
  // [SCREENS.SETTINGS.ABOUT]: undefined;
};

type FullScreenNavigatorParamList = {
  //   [SCREENS.SETTINGS.ROOT]: undefined;
  //   [SCREENS.SETTINGS_CENTRAL_PANE]: NavigatorScreenParams<SettingsCentralPaneNavigatorParamList>;
};

type BottomTabNavigatorParamList = {
  [SCREENS.HOME]: undefined;
  // [SCREENS.ALL_SETTINGS]: undefined;
  // [SCREENS.WORKSPACE.INITIAL]: undefined;
};

type PublicScreensParamList = {
  [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]: NavigatorScreenParams<BottomTabNavigatorParamList>;
  [SCREENS.FORCE_UPDATE]: undefined;
  [SCREENS.SIGNUP]: undefined;
  [SCREENS.LOGIN]: undefined;
  // [SCREENS.TRANSITION_BETWEEN_APPS]: {
  //     email?: string;
  //     error?: string;
  //     shortLivedAuthToken?: string;
  //     shortLivedToken?: string;
  //     exitTo?: Routes | HybridAppRoute;
  // };
};
type AuthScreensParamList = {
  [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]: NavigatorScreenParams<BottomTabNavigatorParamList>;
  [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: NavigatorScreenParams<CentralPaneNavigatorParamList>;
  [SCREENS.NOT_FOUND]: undefined;
  [NAVIGATORS.LEFT_MODAL_NAVIGATOR]: NavigatorScreenParams<LeftModalNavigatorParamList>;
  [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
  [NAVIGATORS.FULL_SCREEN_NAVIGATOR]: NavigatorScreenParams<FullScreenNavigatorParamList>;
};

type RootStackParamList = PublicScreensParamList & AuthScreensParamList;

type BottomTabName = keyof BottomTabNavigatorParamList;

type CentralPaneName = keyof CentralPaneNavigatorParamList;

type FullScreenName = keyof SettingsCentralPaneNavigatorParamList;

type SwitchPolicyIDParams = {
  policyID?: string;
  route?: Routes;
  isPolicyAdmin?: boolean;
};

export type {
  AuthScreensParamList,
  BottomTabName,
  BottomTabNavigatorParamList,
  CentralPaneName,
  CentralPaneNavigatorParamList,
  FullScreenName,
  FullScreenNavigatorParamList,
  LeftModalNavigatorParamList,
  NavigationStateRoute,
  NavigationPartialRoute,
  NavigationRef,
  NavigationRoot,
  PublicScreensParamList,
  RightModalNavigatorParamList,
  RootStackParamList,
  StackNavigationAction,
  State,
  StateOrRoute,
  SwitchPolicyIDParams,
};
