type FriendRequestStatus =
  | 'self'
  | 'sent'
  | 'received'
  | 'friend'
  | 'undefined';

type FriendRequestId = string;

type FriendRequestList = Record<FriendRequestId, FriendRequestStatus>;

type FriendRequestArray = Array<FriendRequestStatus>;

export default FriendRequestList;
export type {FriendRequestStatus, FriendRequestId, FriendRequestArray};
