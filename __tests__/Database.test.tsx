import { ref, get, onValue, off } from 'firebase/database';
import { readUserDataOnce, listenForDataChanges } from '../src/database';

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
}));

const mockDb = {
  users: {
    test_user: {
      username: 'Test user'
    }
  }
};

describe('database functions', () => {
  let onDataChangeMock: jest.Mock;
  
  beforeEach(() => {
      // Mock the 'ref' function to return an object representing the user's database reference
      (ref as jest.Mock).mockReturnValue({});
      onDataChangeMock = jest.fn();
  });

  afterEach(() => {
      jest.clearAllMocks();
  });

  it('listenForDataChanges should invoke onDataChange when data changes', () => {
      const userId = 'test_user';
      
      // Mock the 'onValue' function to simulate a data change event
      (onValue as jest.Mock).mockImplementation((_, callback) => {
          callback({
              val: () => mockDb.users[userId]
          });
      });

      listenForDataChanges(mockDb, userId, onDataChangeMock);

      expect(onDataChangeMock).toHaveBeenCalledWith(mockDb.users[userId]);
  });

  it('returned function should remove the listener', () => {
      const userId = 'test_user';
      const userRef = {};

      // Mock the 'ref' function to return a specific reference object
      (ref as jest.Mock).mockReturnValue(userRef);

      // Mock the 'onValue' function to return a specific listener
      const mockListener = jest.fn();
      (onValue as jest.Mock).mockReturnValue(mockListener);

      const unsubscribe = listenForDataChanges(mockDb, userId, onDataChangeMock);

      unsubscribe();

      expect(off).toHaveBeenCalledWith(userRef, "value", mockListener);
  });
});