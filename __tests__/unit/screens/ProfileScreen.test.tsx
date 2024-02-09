import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
// import ProfileScreen from '../../../src/screens/ProfileScreen';

// Mock the navigation prop used by the component
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock the database
// jest.mock('../src/database', () => ({
//   listenForDataChanges: jest.fn().mockImplementation((db, userId, callback) => {
//     // Return a mock listener function
//     return () => {};
//   }),
//   readUserDataOnce: jest.fn(),
//   saveDrinkingSessionData: jest.fn(),
// }));

xdescribe('<ProfileScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    mockNavigation.navigate.mockClear();
  });

  it('renders correctly', () => {
    // const tree = render(<ProfileScreen navigation={mockNavigation} />).toJSON();
    // expect(tree).toMatchSnapshot();
  });

  it('escape from the profile screen', () => {
    // const {getByTestId} = render(<ProfileScreen navigation={mockNavigation} />);
    // const backButton = getByTestId('escape-profile-screen');
    // fireEvent.press(backButton);
    // expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
