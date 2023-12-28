import Config from 'react-native-config';
import { getAuth, connectAuthEmulator } from "firebase/auth";

const emulatorHost = Config.FIREBASE_AUTH_EMULATOR_HOST;
const [authHost, authPort] = emulatorHost.split(':');

const auth = getAuth();
// connectAuthEmulator(auth, authHost, parseInt(authPort)); // TODO -- rewrite to this
connectAuthEmulator(auth, "http://127.0.0.1:9099"); // This works

export { auth };

// firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(
//   '{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'
// ));

// Now for the last overall workflow step. Once you've prototyped your feature in-app and it looks promising on all your platforms, you can turn to final implementation and testing. For unit testing and CI workflows, you can start up emulators, run scripted tests, and shut down emulators in a single call with the exec command:
// firebase emulators:exec "./testdir/test.sh"
