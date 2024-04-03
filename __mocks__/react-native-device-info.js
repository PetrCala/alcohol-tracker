jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => 'unique-id'),
}));
