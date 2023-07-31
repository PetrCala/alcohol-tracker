import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import MainScreen from '../src/screens/MainScreen';
import DatabaseContext from '../src/DatabaseContext';

// Mock the navigation prop used by the component
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock the database
jest.mock('../src/database');

describe('<MainScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    mockNavigation.navigate.mockClear();
  });

  const navigateFromMainScreen = (screenTestId:string, screenName:string) => {
    // Test navigation to a screen from the main screen
    render(<MainScreen navigation={mockNavigation} />);
    
    const screenButton = screen.getByTestId(screenTestId);
    fireEvent.press(screenButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith(screenName);
  };

  it('renders correctly', () => {
    const tree = render(<MainScreen navigation={mockNavigation} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('navigate to the drinking session screen', () => {
    navigateFromMainScreen('+', 'Drinking Session Screen');
  });

  it('navigate to the profile screen', () => {
    navigateFromMainScreen('profile-icon', 'Profile Screen');
  });

  it('navigate to the social screen', () => {
    navigateFromMainScreen('social-icon', 'Social Screen');
  });
   
  it('navigate to the achievement screen', () => {
    navigateFromMainScreen('achievement-icon', 'Achievement Screen');
  });

  it('navigate to the settings screen', () => {
    navigateFromMainScreen('settings-icon', 'Settings Screen');
  });

});