import {UserId, UserList} from './DatabaseCommon';
import FriendRequestList from './FriendRequestList';

type Profile = {
  display_name: string;
  photo_url: string;
};

type UserProps = {
  profile: Profile;
  friends?: UserList;
  friend_requests?: FriendRequestList;
  role: string;
};

type UserPropsList = Record<UserId, UserProps>;

type ProfileList = Record<UserId, Profile>;

export default UserProps;
export type {Profile, UserPropsList, ProfileList};
