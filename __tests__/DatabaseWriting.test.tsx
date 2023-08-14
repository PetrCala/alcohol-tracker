import { ref, onValue, child, update, push } from "firebase/database";
import { 
  saveDrinkingSessionData
} from '../src/database/baseFunctions';

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  onValue: jest.fn(),
  child: jest.fn(() => ({ push: jest.fn(() => ({ key: '123' })) })),
  push: jest.fn(() => ({ key: '123' })),
}));


const mockDb = {
  users: {
    test_user: {
      username: 'Test user'
    }
  }
};

describe('saveDrinkingSessionData function', () => {
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    // (push as jest.Mock).mockReturnValue({ key: 'mockKey' });
  //   (child as jest.Mock).mockImplementation(() => ({ push: push }));
  //   (ref as jest.Mock).mockImplementation(() => ({ child: child }));
    mockUpdate = jest.fn();
  });

  afterEach(() => {
      jest.clearAllMocks();
  });


  it('should write data to the database successfully', async () => {
    // Arrange
    const userId = 'test_user';
    const units = 5;
    
    // Act
    await saveDrinkingSessionData(mockDb, userId, units);

    // Assert
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should throw an error when writing data fails', async () => {
    // Arrange
    const userId = 'test_user';
    const units = 5;
    
    // make the update function throw an error
    mockUpdate.mockImplementationOnce(() => {
      throw new Error('Database write failed');
    });

    // Act and Assert
    await expect(saveDrinkingSessionData(mockDb, userId, units)).rejects.toThrow('Failed to save drinking session data: Database write failed');
  });
});