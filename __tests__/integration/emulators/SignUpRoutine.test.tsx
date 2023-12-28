// This test suite simulates a complete lifecycle of user creation and deletion
// All of this should run on an emulator suite to test the real-life behavior as close as possible without interacting with the production database

import { auth } from '../../utils/emulators/authEmulator';
import { checkEmulatorStatus } from '../../utils/emulatorTools';
// import SignUpScreen from '../../../src/screens/SignUpScreen';
// import { readDataOnce } from '@database/baseFunctions';

const shouldRunTests = process.env.USE_EMULATORS === 'true';

const describeWithEmulator = shouldRunTests ? describe : describe.skip;

describeWithEmulator('Create and delete a user in the emulated database', () => {
    beforeAll(async () => {
        console.log("Initializing the sign up test suite...")
        // Assert that the emulators are up and running
        const isEmulatorRunning = await checkEmulatorStatus();
        if (!isEmulatorRunning) {
            console.error("Emulators are not running. Exiting the test suite...");
            process.exit(1);
        }

        console.log("Emulators are running")
    });

    it('should connect to the emulator realtime database', async () => {
        console.log(auth);
        console.log("Auth object imported successfully");
    });

    afterAll(async () => {
        // Clean up app instances
        // TODO
        console.log('cleaning up...')
        // await Promise.all(firebase.apps().map((app: firebase.app.App) => app.delete()));
    });
});



// Replace db with firebase

// jest.mock('../../../src/services/firebaseConfig');
// jest.mock('../../../src/utils/firebaseUtils');
// jest.mock('react-native', () => {
//   const RealModule = jest.requireActual('react-native');
//   return {
//     ...RealModule,
//     Alert: {
//       ...RealModule.Alert,
//       alert: jest.fn(),
//     },
//   };
// });

// describeWithEmulator('Create and delete a user in the emulated database', () => {

//     beforeAll(async () => {
//         console.log("Initializing the sign up test suite...")
//     });

//     it('should connect to the emulator realtime database', async () => {
//         expect(1).toBe(1);
//     });

// //   it('should handle sign up', async () => {
// //     const mockAuth = { currentUser: null };
// //     auth.mockReturnValue(mockAuth);

// //     const mockReadDataOnce = jest.fn();
// //     mockReadDataOnce.mockReturnValueOnce('1.0.0'); // minSupportedVersion
// //     mockReadDataOnce.mockReturnValueOnce({}); // betaKeys
// //     readDataOnce.mockImplementation(mockReadDataOnce);
// //     // Create a mock database/storage object
// //     const mockDatabase = { /* mock methods and properties */ };
// //     const mockStorage = { /* mock methods and properties */ };

// //     // Render the SignUpScreen component wrapped with FirebaseContext.Provider
// //     const { getByTestId } = render(
// //         <SignUpScreen />,
// //         { wrapper: FirebaseProvider }
// //     //   <FirebaseContext.Provider value={{ database: mockDatabase, storage: mockStorage }}>
// //     //     <SignUpScreen />
// //     //   </FirebaseContext.Provider>
// //     );

// //     const signUpButton = getByTestId('signUpButton');
// //     fireEvent.press(signUpButton);

// //     await waitFor(() => {
// //       expect(mockReadDataOnce).toHaveBeenCalledTimes(2);
// //       expect(mockReadDataOnce).toHaveBeenCalledWith(db, '/config/app_settings/min_user_creation_possible_version');
// //       expect(mockReadDataOnce).toHaveBeenCalledWith(db, 'beta_keys/');
// //       expect(Alert.alert).not.toHaveBeenCalled();
// //     });
// //   });

// //   it('should handle sign up error', async () => {
// //     const mockAuth = { currentUser: null };
// //     auth.mockReturnValue(mockAuth);

// //     const error = new Error('Test error');
// //     readDataOnce.mockImplementation(() => {
// //       throw error;
// //     });

// //     const { getByTestId } = render(<SignUpScreen />);

// //     const signUpButton = getByTestId('signUpButton');
// //     fireEvent.press(signUpButton);

// //     await waitFor(() => {
// //       expect(Alert.alert).toHaveBeenCalledWith('Data fetch failed', 'Could not fetch the sign-up source data: ' + error.message);
// //     });
// //   });

//   afterAll(async () => {
//     // Clean up app instances
//     // TODO
//     console.log('cleaning up...')
//     // await Promise.all(firebase.apps().map((app: firebase.app.App) => app.delete()));
//   });
// });