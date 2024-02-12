import {UserId} from './DatabaseCommon';
import FriendList from './FriendList';
import FriendRequestList from './FriendRequestList';

type Profile = {
  display_name: string;
  photo_url: string;
};

type UserProps = {
  profile: Profile;
  friends?: FriendList;
  friend_requests?: FriendRequestList;
  role: string;
};

type UserList = Record<UserId, UserProps>;

type ProfileList = Record<UserId, Profile>;

export default UserProps;
export type {Profile, UserList, ProfileList};
