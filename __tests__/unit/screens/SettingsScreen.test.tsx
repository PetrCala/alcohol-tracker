import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import SettingsScreen from '../../../src/screens/SettingsScreen';
import DatabaseContext from '../../../src/context/FirebaseContext';

// Mock the navigation prop used by the component
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};


describe('<SettingsScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    mockNavigation.navigate.mockClear();
  });

  it('renders correctly', () => {
    const tree = render(<SettingsScreen navigation={mockNavigation} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('escape from the settings screen', () => {
    
    const { getByTestId } = render(<SettingsScreen navigation={mockNavigation} />);
    
    const backButton = getByTestId('escape-settings-screen');
    fireEvent.press(backButton);
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

});

