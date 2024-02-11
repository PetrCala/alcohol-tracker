import {FriendId} from './DatabaseCommon';

type FriendList = Record<FriendId, boolean>;

type FriendArray = Array<FriendId>;

export default FriendList;
export type {FriendId, FriendArray};
