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
  /** User first name */
  first_name?: string;

  /** User last name */
  last_name?: string;

  /** User display name */
  display_name: string;

  /** A full URL to the user's profile photo, as stored in the storage bucket */
  photo_url: string;
};

type UserPrivateData = {
  /** User birthdate, stored as a timestamp */
  birthdate?: Timestamp;

  /** User weight */
  weight?: number;

  /** User gender */
  gender?: string;
};

type UserPublicData = {
  /** A timestamp marking the last activity of the user  */
  last_active?: Timestamp;
};

type UserData = {
  /** A timestamp marking when the user agreed to the terms and conditions */
  agreed_to_terms_at?: Timestamp;

  /** A list of friend requests of this user */
  friend_requests?: FriendRequestList;

  /** A list of friends of this user */
  friends?: UserList;

  /** User's private data */
  private_data?: UserPrivateData;

  /** User's profile data */
  profile: Profile;

  /** User's private data */
  public_data?: UserPublicData;

  /** Role of this user */
  role: string;

  /** User's timezone settings */
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
