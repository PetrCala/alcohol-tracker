import { get, ref, onValue, off } from "firebase/database";
import { 
  readUserDataOnce,
  listenForDrinkingSessionChanges
} from '../src/database';'../src/database';

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

describe('data reading functions', () => {
    let onDataChangeMock: jest.Mock;
    
    beforeEach(() => {
        // Mock the 'ref' function to return an object representing the user's database reference
        (ref as jest.Mock).mockReturnValue({});
        onDataChangeMock = jest.fn();
    });
  
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    // Read data once
    it('returns user data if user exists', async () => {
      const existingUserId = 'test_user';
      
      // Mock the 'get' function to simulate a successful database read
      (get as jest.Mock).mockResolvedValue({
        exists: () => true,
        val: () => mockDb.users[existingUserId]
      });
  
      const data = await readUserDataOnce(mockDb, existingUserId);
      expect(data).not.toBeNull();
      expect(data).toEqual(mockDb.users[existingUserId]);
    });
  
    it('returns null if user does not exist', async () => {
      const nonExistingUserId = 'nonExistingUser';
  
      // Mock the 'get' function to simulate a unsuccessful database read (user does not exist)
      (get as jest.Mock).mockResolvedValue({
        exists: () => false,
        val: () => null
      });
  
      const data = await readUserDataOnce(mockDb, nonExistingUserId);
      expect(data).toBeNull();
    });
  
  
    // Listen for data changes
    it('listenForDataChanges should invoke onDataChange when data changes', () => {
        const userId = 'test_user';
        
        // Mock the 'onValue' function to simulate a data change event
        (onValue as jest.Mock).mockImplementation((_, callback) => {
            callback({
                val: () => mockDb.users[userId]
            });
        });
  
        listenForDrinkingSessionChanges(mockDb, userId, onDataChangeMock);
  
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
  
        const unsubscribe = listenForDrinkingSessionChanges(mockDb, userId, onDataChangeMock);
  
        unsubscribe();
  
        expect(off).toHaveBeenCalledWith(userRef, "value", mockListener);
    });
  });