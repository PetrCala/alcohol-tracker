import type {IsEqual, ValueOf} from 'type-fest';
import type CONST from './CONST';

const ROUTES = {
  // If the user opens this route, we'll redirect them to the path saved in the last visited path or to the home page if the last visited path is empty.
  ROOT: '',

  HOME: 'home',
  FORCE_UPDATE: 'force-update',
  LOGIN: 'login',
  SIGNUP: 'signup',

  // This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated
  //   CONCIERGE: 'concierge',
  //   FLAG_COMMENT: {
  //     route: 'flag/:reportID/:reportActionID',
  //     getRoute: (reportID: string, reportActionID: string) =>
  //       `flag/${reportID}/${reportActionID}` as const,
  //   },
  //   SEARCH: 'search',
  //   DETAILS: {
  //     route: 'details',
  //     getRoute: (login: string) =>
  //       `details?login=${encodeURIComponent(login)}` as const,
  //   },
  //   PROFILE: {
  //     route: 'a/:accountID',
  //     getRoute: (accountID: string | number, backTo?: string) =>
  //       getUrlWithBackToParam(`a/${accountID}`, backTo),
  //   },
  //   PROFILE_AVATAR: {
  //     route: 'a/:accountID/avatar',
  //     getRoute: (accountID: string) => `a/${accountID}/avatar` as const,
  //   },
} as const;

export default ROUTES;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractRouteName<TRoute> = TRoute extends {
  getRoute: (...args: any[]) => infer TRouteName;
}
  ? TRouteName
  : TRoute;

type AllRoutes = {
  [K in keyof typeof ROUTES]: ExtractRouteName<(typeof ROUTES)[K]>;
}[keyof typeof ROUTES];

type RouteIsPlainString = IsEqual<AllRoutes, string>;

/**
 * Represents all routes in the app as a union of literal strings.
 *
 * If this type resolves to `never`, it implies that one or more routes defined within `ROUTES` have not correctly used
 * `as const` in their `getRoute` function return value.
 */
type Route = RouteIsPlainString extends true ? never : AllRoutes;

export type {Route};
