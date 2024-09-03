import type {UserID} from './OnyxCommon';

type FeedbackId = string;

type Feedback = {
  submit_time: number;
  text: string;
  user_id: UserID;
};

type FeedbackList = Record<FeedbackId, Feedback>;

export default Feedback;
export type {FeedbackList, FeedbackId};
