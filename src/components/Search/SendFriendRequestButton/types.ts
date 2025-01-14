import type {Database} from 'firebase/database';
import type {FriendRequestStatus} from '@src/types/onyx';

type SendFriendRequestButtonProps = {
  db: Database;
  userFrom: string;
  userTo: string;
  requestStatus: FriendRequestStatus | undefined;
  alreadyAFriend: boolean;
};

export default SendFriendRequestButtonProps;
