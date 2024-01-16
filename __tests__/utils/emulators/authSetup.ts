require('dotenv').config(); // for the process.env variables to read the .env file
import {MOCK_USER_IDS} from '../testsStatic';
import {Auth} from 'firebase/auth';
import {isConnectedToAuthEmulator} from '@src/services/firebaseUtils';
import { signUpUserWithEmailAndPassword } from '@src/auth/auth';

/** Using an emulator authentication object, create authenticated users
 * in the authentication emulator.
 * 
 * @param emulatorAuth Auth object from the emulator.
 * @returns Promise<void>
 */
export async function createMockAuthUsers(emulatorAuth: Auth): Promise<void> {
  if (!isConnectedToAuthEmulator) {
    throw new Error('Not connected to the auth emulator');
  }
  MOCK_USER_IDS.forEach(userId => async () => {
    let email = `${userId}@gmail.com`
    let password = 'mock-password';

    try {
      await signUpUserWithEmailAndPassword(emulatorAuth, email, password);
    } catch (error) {
      throw new Error(`Error creating mock user ${userId}: ${error}`);
    }
  });
};