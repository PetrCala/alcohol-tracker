import {Database, child, push, ref, update} from 'firebase/database';
import {FeedbackData, FeedbackProps} from '../types/database';
import {Alert} from 'react-native';

/** Submit feedback into the database
 *
 * @description Each feedback has its own unique ID that gets created upon pushing the data into the database. The function also automatically creates a timestamp corresponding to the time when the feedback was submitted.
 *
 * @param {Database} db The database object
 * @param {string} userId The user ID
 * @param {string} text The text to be submitted
 * @returns {Promise<void>}
 *
 *  */
export async function submitFeedback(
  db: Database,
  userId: string,
  text: string,
): Promise<void> {
  let timestampNow = new Date().getTime();
  let newFeedback: FeedbackProps = {
    submit_time: timestampNow,
    text: text,
    user_id: userId,
  };
  // Create a new feedback id
  let newFeedbackKey = await push(child(ref(db), `/feedback/`)).key;
  if (!newFeedbackKey) {
    Alert.alert(
      'Failed to submit feedback',
      'The application failed to create a new feedback object in the database',
    );
    return;
  }
  // Create the updates object
  var updates: FeedbackData = {};
  updates[`feedback/${newFeedbackKey}`] = newFeedback;

  // Submit the feedback
  await update(ref(db), updates);
}

/**
 * Remove a feedback item from the database
 *
 * @param {Database} db The database object
 * @param {string} feedbackKey Feedback ID
 */
export async function removeFeedback(
  db: Database,
  feedbackKey: string,
): Promise<void> {
  var updates: {[key: string]: null} = {};
  updates[`/feedback/${feedbackKey}`] = null;
  return await update(ref(db), updates);
}
