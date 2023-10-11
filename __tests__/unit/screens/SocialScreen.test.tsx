import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import SocialScreen from '../../../src/screens/SocialScreen';

// Mock the navigation prop used by the component
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};


describe('<SocialScreen />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    mockNavigation.navigate.mockClear();
  });

  it('renders correctly', () => {
    const tree = render(<SocialScreen navigation={mockNavigation} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('escape from the social screen', () => {
    
    const { getByTestId } = render(<SocialScreen navigation={mockNavigation} />);
    
    const backButton = getByTestId('escape-social-screen');
    fireEvent.press(backButton);
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

});

