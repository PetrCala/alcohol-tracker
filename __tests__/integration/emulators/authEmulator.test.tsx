import { app } from '../../../src/services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import CONST from '@src/CONST';

// Never run these tests outside of the emulator environment
const shouldRunTests = process.env.ENVIRONMENT === CONST.ENVIRONMENT.TEST;

const describeWithEmulator = shouldRunTests ? describe : describe.skip;

describeWithEmulator('Firebase Auth Emulator', () => {
  
  it('should initialize', () => {
    // TODO
    expect(1).toEqual(1);
    console.log(app);
  });
  // it('should create a new user', async () => {
  //   const newUserEmail = 'newuser@example.com';
  //   const newUserPassword = 'password';

  //   const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
  //   expect(userCredential.user).toBeTruthy();
  //   expect(userCredential.user.email).toBe(newUserEmail);
  // });
});