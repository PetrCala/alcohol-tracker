import type {UserID, UserList} from './OnyxCommon';
import type FriendRequestList from './FriendRequestList';

type Profile = {
  display_name: string;
  photo_url: string;
};

type UserProps = {
  email_verified?: boolean;
  profile: Profile;
  private_data?: any; // TODO: Define this type
  personal_data?: any; // TODO: Define this type
  friends?: UserList;
  friend_requests?: FriendRequestList;
  role: string;
};

type UserPropsList = Record<UserID, UserProps>;

type ProfileList = Record<UserID, Profile>;

export default UserProps;
export type {Profile, UserPropsList, ProfileList};
