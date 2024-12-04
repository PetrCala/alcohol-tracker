import type {UserID} from './OnyxCommon';

/**
 *
 */
type BugId = string;

/**
 *
 */
type Bug = {
  /**
   *
   */
  submit_time: number;
  /**
   *
   */
  text: string;
  /**
   *
   */
  user_id: UserID;
};

/**
 *
 */
type BugList = Record<BugId, Bug>;

export default Bug;
export type {BugList, BugId};
