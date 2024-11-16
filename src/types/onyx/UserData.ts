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

type UserData = {
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

export default UserData;
export type {
  Profile,
  UserPublicData,
  UserPrivateData,
  UserDataList,
  ProfileList,
};
