import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Create a new user in the database
 *
 * @param auth
 * @param email
 * @param password
 * @returns
 */
async function signUpUserWithEmailAndPassword(
  auth: any,
  email: string,
  password: string,
) {
  try {
    // const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // return userCredential.user;
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error('User creation failed: ' + error.message);
  }
}

async function signInUserWithEmailAndPassword(
  auth: any,
  email: string,
  password: string,
) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error('User login failed: ' + error.message);
  }
}

export {signInUserWithEmailAndPassword, signUpUserWithEmailAndPassword};
