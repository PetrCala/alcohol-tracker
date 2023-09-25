import { get, ref, onValue, off } from "firebase/database";
import { 
  readDataOnce,
  listenForDataChanges
} from '../../../src/database/baseFunctions';
import { AppSettings, ConfigProps, CurrentSessionData, DatabaseProps, FeedbackData, FeedbackProps, PreferencesData, UnconfirmedDaysData, UnitsToColorsData, UserData } from "../../../src/types/database";
import { createMockConfig, createMockDatabase, createMockFeedback, createMockSession } from "../../../src/utils/testing/mockDatabase";

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
}));


let mockDb = createMockDatabase();


// describe('data reading functions', () => {
//     let onDataChangeMock: jest.Mock;
    
//     beforeEach(() => {
//         // Mock the 'ref' function to return an object representing the user's database reference
//         (ref as jest.Mock).mockReturnValue({});
//         onDataChangeMock = jest.fn();
//     });
  
//     afterEach(() => {
//         jest.clearAllMocks();
//     });
    
//     // Read data once
//     it('returns user data if user exists', async () => {
//       const existingUserId = 'test_user';
      
//       // Mock the 'get' function to simulate a successful database read
//       (get as jest.Mock).mockResolvedValue({
//         exists: () => true,
//         val: () => mockDb.users[existingUserId]
//       });
  
//       const data = await readDataOnce(mockDb, existingUserId);
//       expect(data).not.toBeNull();
//       expect(data).toEqual(mockDb.users[existingUserId]);
//     });

// });
  
//     it('returns null if user does not exist', async () => {
//       const nonExistingUserId = 'nonExistingUser';
  
//       // Mock the 'get' function to simulate a unsuccessful database read (user does not exist)
//       (get as jest.Mock).mockResolvedValue({
//         exists: () => false,
//         val: () => null
//       });
  
//       const data = await readDataOnce(mockDb, nonExistingUserId);
//       expect(data).toBeNull();
//     });
  
  
//     // Listen for data changes
//     it('listenForDataChanges should invoke onDataChange when data changes', () => {
//         const userId = 'test_user';
        
//         // Mock the 'onValue' function to simulate a data change event
//         (onValue as jest.Mock).mockImplementation((_, callback) => {
//             callback({
//                 val: () => mockDb.users[userId]
//             });
//         });
  
//         listenForDataChanges(mockDb, userId, onDataChangeMock);
  
//         expect(onDataChangeMock).toHaveBeenCalledWith(mockDb.users[userId]);
//     });
  
//     it('returned function should remove the listener', () => {
//         const userId = 'test_user';
//         const userRef = {};
  
//         // Mock the 'ref' function to return a specific reference object
//         (ref as jest.Mock).mockReturnValue(userRef);
  
//         // Mock the 'onValue' function to return a specific listener
//         const mockListener = jest.fn();
//         (onValue as jest.Mock).mockReturnValue(mockListener);
  
//         const unsubscribe = listenForDataChanges(mockDb, userId, onDataChangeMock);
  
//         unsubscribe();
  
//         expect(off).toHaveBeenCalledWith(userRef, "value", mockListener);
//     });
//   });


// import { ref, onValue, child, update, push } from "firebase/database";
// import { 
// } from '../src/database/baseFunctions';

// jest.mock('firebase/database', () => ({
//   ref: jest.fn(),
//   onValue: jest.fn(),
//   child: jest.fn(() => ({ push: jest.fn(() => ({ key: '123' })) })),
//   push: jest.fn(() => ({ key: '123' })),
// }));


// const mockDb = {
//   users: {
//     test_user: {
//       username: 'Test user'
//     }
//   }
// };

// describe('saveDrinkingSessionData function', () => {
//   let mockUpdate: jest.Mock;

//   beforeEach(() => {
//     // (push as jest.Mock).mockReturnValue({ key: 'mockKey' });
//   //   (child as jest.Mock).mockImplementation(() => ({ push: push }));
//   //   (ref as jest.Mock).mockImplementation(() => ({ child: child }));
//     mockUpdate = jest.fn();
//   });

//   afterEach(() => {
//       jest.clearAllMocks();
//   });


//   it('should write data to the database successfully', async () => {
//     // Arrange
//     const userId = 'test_user';
//     const units = 5;
    
//     // Act
//     await saveDrinkingSessionData(mockDb, userId, units);

//     // Assert
//     expect(mockUpdate).toHaveBeenCalled();
//   });

//   it('should throw an error when writing data fails', async () => {
//     // Arrange
//     const userId = 'test_user';
//     const units = 5;
    
//     // make the update function throw an error
//     mockUpdate.mockImplementationOnce(() => {
//       throw new Error('Database write failed');
//     });

//     // Act and Assert
//     await expect(saveDrinkingSessionData(mockDb, userId, units)).rejects.toThrow('Failed to save drinking session data: Database write failed');
//   });
// });