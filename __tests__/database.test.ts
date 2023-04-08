// import { useContext } from 'react';
// import { getDatabase, ref, onValue, off } from 'firebase/database';
// import { readDataOnce, listenForDataChanges } from '../src/database';
// import DatabaseContext from '../src/DatabaseContext';

// jest.mock('firebase/database');
// jest.mock('../src/DatabaseContext', () => ({
//   __esModule: true,
//   default: jest.fn(),
// }));

// const mockDb = {
//   // Add any necessary mocked properties and methods here
// };

// describe('database functions', () => {
//   const userId = 'user1';
//   const db = mockDb;

//   beforeEach(() => {
//     // Set the mocked context value before each test
//     DatabaseContext.mockImplementation(() => db);
//   });//

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('calls readDataOnce with the correct user ID', () => {
//     if (db) {
//       readDataOnce(db, userId);
//     }

//     expect(ref).toHaveBeenCalledWith(expect.anything(), `users/${userId}`);
//     expect(onValue).toHaveBeenCalled();
//   });

//   it('calls listenForDataChanges with the correct user ID and returns a cleanup function', () => {
//     const onDataChange = jest.fn();
//     if (db) {
//       const cleanupFunction = listenForDataChanges(db, userId, onDataChange);
       
//       expect(ref).toHaveBeenCalledWith(expect.anything(), `users/${userId}`);
//       expect(onValue).toHaveBeenCalled();
  
//       cleanupFunction();
//       expect(off).toHaveBeenCalled();
//     }

//   });
// });