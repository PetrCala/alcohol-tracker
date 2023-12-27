import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../../../src/screens/SignUpScreen';
import { auth } from '../../../src/services/firebaseConfig';
import { readDataOnce } from '@database/baseFunctions';
import { Alert } from 'react-native';
import { FirebaseProvider } from '../../../src/context/FirebaseContext'; // adjust the path as needed

const shouldRunTests = process.env.USE_EMULATORS === 'true';

const describeWithEmulator = shouldRunTests ? describe : describe.skip;

console.log("All imports were successful");

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

// describeWithEmulator('SignUpScreen', () => {

//   it('should handle sign up', async () => {
//     const mockAuth = { currentUser: null };
//     auth.mockReturnValue(mockAuth);

//     const mockReadDataOnce = jest.fn();
//     mockReadDataOnce.mockReturnValueOnce('1.0.0'); // minSupportedVersion
//     mockReadDataOnce.mockReturnValueOnce({}); // betaKeys
//     readDataOnce.mockImplementation(mockReadDataOnce);
//     // Create a mock database/storage object
//     const mockDatabase = { /* mock methods and properties */ };
//     const mockStorage = { /* mock methods and properties */ };

//     // Render the SignUpScreen component wrapped with FirebaseContext.Provider
//     const { getByTestId } = render(
//         <SignUpScreen />,
//         { wrapper: FirebaseProvider }
//     //   <FirebaseContext.Provider value={{ database: mockDatabase, storage: mockStorage }}>
//     //     <SignUpScreen />
//     //   </FirebaseContext.Provider>
//     );

//     const signUpButton = getByTestId('signUpButton');
//     fireEvent.press(signUpButton);

//     await waitFor(() => {
//       expect(mockReadDataOnce).toHaveBeenCalledTimes(2);
//       expect(mockReadDataOnce).toHaveBeenCalledWith(db, '/config/app_settings/min_user_creation_possible_version');
//       expect(mockReadDataOnce).toHaveBeenCalledWith(db, 'beta_keys/');
//       expect(Alert.alert).not.toHaveBeenCalled();
//     });
//   });

//   it('should handle sign up error', async () => {
//     const mockAuth = { currentUser: null };
//     auth.mockReturnValue(mockAuth);

//     const error = new Error('Test error');
//     readDataOnce.mockImplementation(() => {
//       throw error;
//     });

//     const { getByTestId } = render(<SignUpScreen />);

//     const signUpButton = getByTestId('signUpButton');
//     fireEvent.press(signUpButton);

//     await waitFor(() => {
//       expect(Alert.alert).toHaveBeenCalledWith('Data fetch failed', 'Could not fetch the sign-up source data: ' + error.message);
//     });
//   });
// });