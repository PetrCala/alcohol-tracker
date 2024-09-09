import type {
  DrinkingSessionList,
  Preferences,
  UnconfirmedDays,
  UserProps,
  UserStatus,
} from '@src/types/onyx';
import type {StringKeyOf, ValueOf} from 'type-fest';

/** Main nodes of the database are meant to be fetched from the database
 * for general use (such as upon app start).
 */
type FetchData = {
  userStatusData?: UserStatus;
  drinkingSessionData?: DrinkingSessionList;
  preferences?: Preferences;
  unconfirmedDays?: UnconfirmedDays;
  userData?: UserProps;
};

type FetchDataKey = StringKeyOf<FetchData>;
type FetchDataValue = ValueOf<FetchData>;

type FetchDataKeys = FetchDataKey[];

export type {FetchData, FetchDataKey, FetchDataValue, FetchDataKeys};
