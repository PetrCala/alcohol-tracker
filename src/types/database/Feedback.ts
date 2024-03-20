import {UserId} from './DatabaseCommon';

type FeedbackId = string;

type Feedback = {
  submit_time: number;
  text: string;
  user_id: UserId;
};

type FeedbackList = Record<FeedbackId, Feedback>;

export default Feedback;
export type {FeedbackList, FeedbackId};
