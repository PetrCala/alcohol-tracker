import { app, auth } from '../../../src/utils/firebaseUtils';
import { createUserWithEmailAndPassword } from 'firebase/auth';

describe('Firebase Auth Emulator', () => {
  it('should create a new user', async () => {
    const newUserEmail = 'newuser@example.com';
    const newUserPassword = 'password';

    const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
    expect(userCredential.user).toBeTruthy();
    expect(userCredential.user.email).toBe(newUserEmail);

  });

  // Add more tests as needed for your auth flows
});