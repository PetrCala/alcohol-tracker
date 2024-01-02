jest.mock('react-native-config', () => require('__mocks__/react-native-config'));
jest.mock('react-native', () => require('__mocks__/react-native'));

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "@firebase/auth";
import { firebaseConfig } from "../../../src/services/firebaseConfig";

export function emulatorConnect() {
  const auth = firebase.auth();
  auth.useEmulator("http://127.0.0.1:9099");
}

function emulatorGoogleCredential() {
  const auth = firebase.auth();
  auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(
    '{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'
  ));  
}
console.log("Importing firebase config...")
console.log(firebaseConfig);

console.log("Trying to connect...")
const auth = getAuth();
// connectAuthEmulator(auth, authHost, parseInt(authPort)); // TODO -- rewrite to this
connectAuthEmulator(auth, "http://127.0.0.1:9099"); // This works
console.log(auth);

export {auth};

// export { auth };

// firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(
//   '{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'
// ));

// Now for the last overall workflow step. Once you've prototyped your feature in-app and it looks promising on all your platforms, you can turn to final implementation and testing. For unit testing and CI workflows, you can start up emulators, run scripted tests, and shut down emulators in a single call with the exec command:
// firebase emulators:exec "./testdir/test.sh"
