import type {TupleToUnion} from 'type-fest';
import type TIMEZONES from '@src/TIMEZONES';
import type {Timestamp, UserID, UserList} from './OnyxCommon';
import type FriendRequestList from './FriendRequestList';

/** Selectable timezones */
type SelectedTimezone = TupleToUnion<typeof TIMEZONES>;

type Timezone = {
  /** Value of selected timezone */
  selected?: SelectedTimezone;

  /** Whether timezone is automatically set */
  automatic?: boolean;
};

type Profile = {
  first_name?: string;
  last_name?: string;
  display_name: string;
  photo_url: string;
};

type UserPrivateData = {
  birthdate?: number;
  weight?: number;
  gender?: string;
};

type UserPublicData = {
  last_active?: Timestamp;
};

type UserData = {
  agreed_to_terms_at?: Timestamp;
  friend_requests?: FriendRequestList;
  friends?: UserList;
  private_data?: UserPrivateData;
  profile: Profile;
  public_data?: UserPublicData;
  role: string;
  timezone?: Timezone;
};

type UserDataList = Record<UserID, UserData>;

type ProfileList = Record<UserID, Profile>;

/** Model of user data metadata */
type UserDataMetadata = {
  /** Whether we are waiting for the data to load via the API */
  isLoading?: boolean;
};

export default UserData;
export type {
  Profile,
  Timezone,
  SelectedTimezone,
  UserPublicData,
  UserPrivateData,
  UserDataList,
  UserDataMetadata,
  ProfileList,
};
