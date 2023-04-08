import React from 'react';
import { render, act } from '@testing-library/react-native';
import MainScreen from '../src/screens/MainScreen';
import { readDataOnce, listenForDataChanges } from '../src/database';

jest.mock('../src/database');

describe('MainScreen', () => {
  it('calls readDataOnce and listenForDataChanges on mount', () => {
    act(() => {
      render(<MainScreen navigation={{} as any} />);
    });

    expect(readDataOnce).toHaveBeenCalled();
    expect(listenForDataChanges).toHaveBeenCalled();
  });
});