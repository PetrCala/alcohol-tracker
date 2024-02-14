/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// Moved to a separate file to avoid cyclic dependencies.
const config: LinkingOptions<RootStackParamList>['config'] = {
  initialRouteName: NAVIGATORS.BOTTOM_TAB_NAVIGATOR,
  screens: {
    // Main Routes
    [SCREENS.FORCE_UPDATE]: ROUTES.FORCE_UPDATE,
    [SCREENS.LOGIN]: ROUTES.LOGIN,
    [SCREENS.SIGNUP]: ROUTES.SIGNUP,

    // Sidebar
    [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]: {
      path: ROUTES.ROOT,
      initialRouteName: SCREENS.HOME,
      screens: {
        [SCREENS.HOME]: ROUTES.HOME,
        // [SCREENS.ALL_SETTINGS]: ROUTES.ALL_SETTINGS,
        // [SCREENS.WORKSPACE.INITIAL]: {
        //   path: ROUTES.WORKSPACE_INITIAL.route,
        //   exact: true,
        // },
      },
    },

    [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: {
      screens: {
        // [SCREENS.SETTINGS.WORKSPACES]: ROUTES.SETTINGS_WORKSPACES,
        // [SCREENS.WORKSPACE.PROFILE]: ROUTES.WORKSPACE_PROFILE.route,
        // [SCREENS.WORKSPACE.CARD]: {
        //   path: ROUTES.WORKSPACE_CARD.route,
        // },
      },
    },
    [SCREENS.NOT_FOUND]: '*',
    [NAVIGATORS.LEFT_MODAL_NAVIGATOR]: {
      screens: {
        //         [SCREENS.LEFT_MODAL.SEARCH]: {
        //             screens: {
        //                 [SCREENS.SEARCH_ROOT]: ROUTES.SEARCH,
        //             },
        //         },
        //         [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: {
        //             screens: {
        //                 [SCREENS.WORKSPACE_SWITCHER.ROOT]: {
        //                     path: ROUTES.WORKSPACE_SWITCHER,
        //                 },
        //             },
        //         },
      },
    },
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: {
      screens: {
        // [SCREENS.RIGHT_MODAL.SETTINGS]: {
        //   screens: {
        //     [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: {
        //       path: ROUTES.SETTINGS_PRIORITY_MODE,
        //       exact: true,
        //     },
        //     [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: {
        //       path: ROUTES.SETTINGS_LANGUAGE,
        //       exact: true,
        //     },
        //     [SCREENS.SETTINGS.PREFERENCES.THEME]: {
        //       path: ROUTES.SETTINGS_THEME,
        //       exact: true,
        //     },
        // [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: {
        //   path: ROUTES.SETTINGS_DISPLAY_NAME,
        //   exact: true,
        // },
        // [SCREENS.SETTINGS.PROFILE.TIMEZONE]: {
        //   path: ROUTES.SETTINGS_TIMEZONE,
        //   exact: true,
        // },
      },
      // [SCREENS.RIGHT_MODAL.PRIVATE_NOTES]: {
      //   screens: {
      //     [SCREENS.PRIVATE_NOTES.LIST]: ROUTES.PRIVATE_NOTES_LIST.route,
      //     [SCREENS.PRIVATE_NOTES.EDIT]: ROUTES.PRIVATE_NOTES_EDIT.route,
      //   },
      // },
      // },
    },

    [NAVIGATORS.FULL_SCREEN_NAVIGATOR]: {
      screens: {
        // [SCREENS.SETTINGS.ROOT]: {
        //   path: ROUTES.SETTINGS,
        // },
        // [SCREENS.SETTINGS_CENTRAL_PANE]: {
        //   screens: {
        //     [SCREENS.SETTINGS.SHARE_CODE]: {
        //       path: ROUTES.SETTINGS_SHARE_CODE,
        //       exact: true,
        //     },
        //     [SCREENS.SETTINGS.PROFILE.ROOT]: {
        //       path: ROUTES.SETTINGS_PROFILE,
        //       exact: true,
        //     },
        //     [SCREENS.SETTINGS.PREFERENCES.ROOT]: {
        //       path: ROUTES.SETTINGS_PREFERENCES,
        //       exact: true,
        //     },
        // [SCREENS.SETTINGS.ABOUT]: {
        //   path: ROUTES.SETTINGS_ABOUT,
        //   exact: true,
        // },
        //       },
        //     },
        //   },
      },
    },
  },
};

export default config;
