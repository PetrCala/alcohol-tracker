import type {Timestamp, UserID} from './OnyxCommon';

/** A bug unique identifier */
type BugId = string;

/** A bug model */
type Bug = {
  /** Time when the bug was submitted */
  submit_time: Timestamp;

  /** Explanation of the bug */
  text: string;

  /** ID of the user that submitted the bug */
  user_id: UserID;
};

/** A collection of bugs, mapping bug IDs to the bug content */
type BugList = Record<BugId, Bug>;

export default Bug;
export type {BugList, BugId};
