import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import AchievementScreen from '../../../src/screens/AchievementScreen';
import DatabaseContext from '../../../src/context/DatabaseContext';

// Mock the navigation prop used by the component
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};


describe('<AchievementScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    mockNavigation.navigate.mockClear();
  });

  it('renders correctly', () => {
    const tree = render(<AchievementScreen navigation={mockNavigation} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('escape from the achievement screen', () => {
    
    const { getByTestId } = render(<AchievementScreen navigation={mockNavigation} />);
    
    const backButton = getByTestId('escape-achievement-screen');
    fireEvent.press(backButton);
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

});