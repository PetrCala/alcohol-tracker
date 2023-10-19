import * as functions from 'firebase-functions'
import admin from '@database/admin';
import { validateBetaKey } from '@database/beta';
import { pushNewUserInfo } from '@database/users';
import { validateAppVersion, validateSignInInput } from '@utils/validation';

// Must install firebase CLI using $npm install -g firebase-tools and add AppData\Roaming\npm to the environmental path --> see the help for Firebase Functions on logging in, etc.

type CreateUserReturnProps = {
  success: boolean,
  uid: string | null,
  message?: string
}

export const createUser = functions.https.onCall(async (data, context):Promise<CreateUserReturnProps> => {
  const { email, password, username, betaKey }: {
      email: string,
      password: string,
      username: string,
      betaKey: string
  } = data;

  // Validate the sign in input
  const signInInputValidationResult = validateSignInInput(email, username, password, betaKey);
  if (!signInInputValidationResult.success) {
    return { success: false, uid: null, message: signInInputValidationResult?.message };
  }

  // Validate the minimum supported version
  const minSupportedVersionRef = admin.database().ref('/config/app_settings/min_user_creation_possible_version')
  const minSupportedVersionSnapshot = await minSupportedVersionRef.once('value')
  const minSupportedVersionData = minSupportedVersionSnapshot.val();
  if (!minSupportedVersionData) {
      return { success: false, uid: null, message: 'Failed to fetch the minimum supported version data' };
  }
  const versionValidationResult = validateAppVersion(minSupportedVersionData)
  if (!versionValidationResult.success) {
    return { success: false, uid: null, message: versionValidationResult?.message };
  }

  // Check beta key validity and other preconditions
  const betaKeysRef = admin.database().ref('beta_keys/');
  const betaKeysSnapshot = await betaKeysRef.once('value');
  const betaKeysData = betaKeysSnapshot.val();
  if (!betaKeysData) {
      return { success: false, uid: null, message: 'Failed to fetch the beta keys data' };
  }
  const betaKeyId = validateBetaKey(betaKeysData, betaKey);
  if (!betaKeyId) {
      return { success: false, uid: null, message: 'Your beta key is either invalid or already in use.' };
  }

  // Create user in Firebase Authentication
  const userRecord = await admin.auth().createUser({
    email: email,
    password: password,
    displayName: username
  });

  // Write to the Realtime Database
  const newProfileData = {
    display_name: username,
    photo_url: "",
  };
  await pushNewUserInfo(admin.database(), userRecord.uid, newProfileData, betaKey);

  return { success: true, uid: userRecord.uid };
});
