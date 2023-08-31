import { child, push, ref, update } from "firebase/database";
import { FeedbackData, FeedbackProps } from "../types/database";
import { Alert } from "react-native";

/** Submit feedback into the database
 * 
 * @param db The database object
 * @param userId The user ID
 * @param text The text to be submitted
 * 
 * Each feedback has its own unique ID that gets created upon
 * pushing the data into the database. The function also automatically
 * creates a timestamp corresponding to the time when the feedback
 * was submitted.
 *  */
export async function submitFeedback(
    db: any,
    userId: string,
    text: string,
){
    let newFeedbackKey: string | null = null;
    let timestampNow = new Date().getTime();
    let newFeedback: FeedbackProps = {
        submit_time: timestampNow,
        text: text,
        user_id: userId
    };
    // Create a new feedback id
    try {
        newFeedbackKey = await push(child(ref(db), `/feedback/`)).key 
    } catch (error:any) {
        throw new Error('Failed to create a new session reference point: ' + error.message);
    }
    if (!newFeedbackKey) Alert.alert('Failed to submit feedback', 'The application failed to create a new feedback object in the database');
    // Create the updates object
    var updates:FeedbackData = {};
    updates[`feedback/${newFeedbackKey}`] = newFeedback;

    // Submit the feedback
    try {
        await update(ref(db), updates);
    } catch (error:any) {
        Alert.alert('Feedback submission failed', 'Failed to save the feedback: ' + error.message);
    };
};


/** Remove a feedback item from the database
 *
 * Throw an error in case the removal fails.
 *  */ 
export async function removeFeedback(
  db: any, 
  feedbackKey: string,
) {
  var updates: {[key: string]: null} = {};
  updates[`/feedback/${feedbackKey}`] = null;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    Alert.alert('Failed to remove feedback', 'Feedback could not be removed: ' + error.message);
  }
};

