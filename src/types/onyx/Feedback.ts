import type {Timestamp, UserID} from './OnyxCommon';

/** A feedback identifier key */
type FeedbackId = string;

/** A model of the feedback data */
type Feedback = {
  /** Time when the feedback was submitted */
  submit_time: Timestamp;

  /** The feedback content */
  text: string;

  /** ID of the user that submitted the feedback */
  user_id: UserID;
};

/** A list mapping feedback IDs to feedback objects */
type FeedbackList = Record<FeedbackId, Feedback>;

export default Feedback;
export type {FeedbackList, FeedbackId};
