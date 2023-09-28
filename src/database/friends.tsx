import database from '@react-native-firebase/database';

/**
 * Check if userB is in userA's friend list.
 * 
 * @param {string} userA - User ID of the authenticated user.
 * @param {string} userB - User ID of the friend being checked.
 * @returns {Promise<boolean>} - Returns true if userB is a friend of userA, otherwise false.
 */
async function isFriend(userA:string, userB:string):Promise<boolean> {
  const snapshot = await database().ref(`/users/${userA}/friends/${userB}`).once('value');
  return snapshot.exists();
};

/**
 * Fetch the profile details of a given user.
 * 
 * @param {string} userId - User ID whose profile details need to be fetched.
 * @returns {Promise<Object>} - Returns the user profile object if exists, otherwise undefined.
 */
async function fetchUserProfile(userId:string):Promise<Object> {
  const snapshot = await database().ref(`/users/${userId}/profile`).once('value');
  return snapshot.val();
};
