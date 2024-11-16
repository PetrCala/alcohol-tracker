import type {UserID, UserList} from './OnyxCommon';
import type FriendRequestList from './FriendRequestList';
import type {Timezone} from '@src/types/onyx/PersonalDetails';

type Profile = {
  first_name?: string; // TODO: make required from 0.4.x
  last_name?: string; // TODO: make required from 0.4.x
  display_name: string;
  photo_url: string;
};

type UserPrivateData = {
  birthdate?: number;
  weight?: number;
  gender?: string;
};

type UserPublicData = {
  last_active?: number;
};

type UserProps = {
  friend_requests?: FriendRequestList;
  friends?: UserList;
  private_data?: UserPrivateData;
  profile: Profile;
  public_data?: UserPublicData;
  role: string;
  timezone?: Timezone;
};

type UserPropsList = Record<UserID, UserProps>;

type ProfileList = Record<UserID, Profile>;

export default UserProps;
export type {
  Profile,
  UserPublicData,
  UserPrivateData,
  UserPropsList,
  ProfileList,
};
