import type {Database} from 'firebase/database';
import {child, push, ref, update} from 'firebase/database';
import type {FeedbackList, Feedback} from '../types/onyx';
import {Alert} from 'react-native';
import DBPATHS from './DBPATHS';

const feedbackItemRef = DBPATHS.FEEDBACK_FEEDBACK_ID;

/** Submit feedback into the database
 *
 * @description Each feedback has its own unique ID that gets created upon pushing the data into the database. The function also automatically creates a timestamp corresponding to the time when the feedback was submitted.
 *
 * @param db The database object
 * @param userID The user ID
 * @param text The text to be submitted
 * @returns An empty promise
 *
 *  */
export async function submitFeedback(
  db: Database,
  userID: string,
  text: string,
): Promise<void> {
  const timestampNow = new Date().getTime();
  const newFeedback: Feedback = {
    submit_time: timestampNow,
    text: text,
    user_id: userID,
  };
  // Create a new feedback id
  const newFeedbackKey = push(child(ref(db), DBPATHS.FEEDBACK)).key;
  if (!newFeedbackKey) {
    Alert.alert(
      'Failed to submit feedback',
      'The application failed to create a new feedback object in the database',
    );
    return;
  }
  // Create the updates object
  const updates: FeedbackList = {};
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
  const updates: Record<string, null> = {};
  updates[feedbackItemRef.getRoute(feedbackKey)] = null;
  return update(ref(db), updates);
}
