import {Database, child, push, ref, update} from 'firebase/database';
import {FeedbackList, Feedback} from '../types/onyx';
import {Alert} from 'react-native';
import DBPATHS from './DBPATHS';

const feedbackItemRef = DBPATHS.FEEDBACK_FEEDBACK_ID;

/** Submit feedback into the database
 *
 * @description Each feedback has its own unique ID that gets created upon pushing the data into the database. The function also automatically creates a timestamp corresponding to the time when the feedback was submitted.
 *
 * @param db The database object
 * @param userId The user ID
 * @param text The text to be submitted
 * @returns An empty promise
 *
 *  */
export async function submitFeedback(
  db: Database,
  userId: string,
  text: string,
): Promise<void> {
  let timestampNow = new Date().getTime();
  let newFeedback: Feedback = {
    submit_time: timestampNow,
    text: text,
    user_id: userId,
  };
  // Create a new feedback id
  let newFeedbackKey = push(child(ref(db), DBPATHS.FEEDBACK)).key;
  if (!newFeedbackKey) {
    Alert.alert(
      'Failed to submit feedback',
      'The application failed to create a new feedback object in the database',
    );
    return;
  }
  // Create the updates object
  var updates: FeedbackList = {};
  updates[feedbackItemRef.getRoute(newFeedbackKey)] = newFeedback;

  // Submit the feedback
  await update(ref(db), updates);
}

/**
 * Remove a feedback item from the database
 *
 * @param db The database object
 * @param feedbackKey Feedback ID
 */
export async function removeFeedback(
  db: Database,
  feedbackKey: string,
): Promise<void> {
  var updates: {[key: string]: null} = {};
  updates[feedbackItemRef.getRoute(feedbackKey)] = null;
  return await update(ref(db), updates);
}
