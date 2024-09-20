/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';
import type {RouteConfig} from './createNormalizedConfigs';
import createNormalizedConfigs from './createNormalizedConfigs';

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

    [SCREENS.NOT_FOUND]: '*',
    [NAVIGATORS.LEFT_MODAL_NAVIGATOR]: {
      screens: {
        //         [SCREENS.LEFT_MODAL.SEARCH]: {
        //             screens: {
        //                 [SCREENS.SEARCH_ROOT]: ROUTES.SEARCH,
        //             },
        //         },
        // ...
      },
    },
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: {
      screens: {
        [SCREENS.RIGHT_MODAL.ACHIEVEMENTS]: {
          screens: {
            [SCREENS.ACHIEVEMENTS.ROOT]: ROUTES.ACHIEVEMENTS,
          },
        },
        [SCREENS.RIGHT_MODAL.DAY_OVERVIEW]: {
          screens: {
            [SCREENS.DAY_OVERVIEW.ROOT]: {
              path: ROUTES.DAY_OVERVIEW.route,
            },
          },
        },
        [SCREENS.RIGHT_MODAL.DRINKING_SESSION]: {
          screens: {
            [SCREENS.DRINKING_SESSION.ROOT]: {
              path: ROUTES.DRINKING_SESSION.route,
            },
            [SCREENS.DRINKING_SESSION.LIVE]: {
              path: ROUTES.DRINKING_SESSION_LIVE.route,
            },
            [SCREENS.DRINKING_SESSION.SUMMARY]: {
              path: ROUTES.DRINKING_SESSION_SUMMARY.route,
            },
          },
        },
        [SCREENS.RIGHT_MODAL.SETTINGS]: {
          screens: {
            [SCREENS.SETTINGS.ROOT]: ROUTES.SETTINGS,
            [SCREENS.SETTINGS.APP_SHARE]: ROUTES.SETTINGS_APP_SHARE,
            [SCREENS.SETTINGS.ACCOUNT]: ROUTES.SETTINGS_ACCOUNT,
            [SCREENS.SETTINGS.PREFERENCES]: ROUTES.SETTINGS_PREFERENCES,
            [SCREENS.SETTINGS.PRIVACY_POLICY]: ROUTES.SETTINGS_PRIVACY_POLICY,
            [SCREENS.SETTINGS.TERMS_OF_SERVICE]:
              ROUTES.SETTINGS_TERMS_OF_SERVICE,
          },
        },
        [SCREENS.RIGHT_MODAL.PROFILE]: {
          screens: {
            [SCREENS.PROFILE.ROOT]: {
              path: ROUTES.PROFILE.route,
            },
            [SCREENS.PROFILE.FRIENDS_FRIENDS]: {
              path: ROUTES.PROFILE_FRIENDS_FRIENDS.route,
            },
          },
        },
        [SCREENS.RIGHT_MODAL.SOCIAL]: {
          screens: {
            [SCREENS.SOCIAL.ROOT]: ROUTES.SOCIAL,
            [SCREENS.SOCIAL.FRIEND_LIST]: ROUTES.SOCIAL_FRIEND_LIST,
            [SCREENS.SOCIAL.FRIEND_REQUESTS]: ROUTES.SOCIAL_FRIEND_REQUESTS,
            [SCREENS.SOCIAL.FRIEND_SEARCH]: ROUTES.SOCIAL_FRIEND_SEARCH,
          },
        },
        [SCREENS.RIGHT_MODAL.STATISTICS]: {
          screens: {
            [SCREENS.STATISTICS.ROOT]: ROUTES.STATISTICS,
          },
        },
      },
    },
  },
};

const normalizedConfigs = Object.keys(config.screens)
  .map(key =>
    createNormalizedConfigs(
      key,
      config.screens,
      [],
      config.initialRouteName
        ? [
            {
              initialRouteName: config.initialRouteName,
              parentScreens: [],
            },
          ]
        : [],
      [],
    ),
  )
  .flat()
  .reduce(
    (acc, route) => {
      acc[route.screen as Screen] = route;
      return acc;
    },
    {} as Record<Screen, RouteConfig>,
  );

export {normalizedConfigs};
export default config;
