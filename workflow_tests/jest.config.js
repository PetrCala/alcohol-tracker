module.exports = {
  verbose: true,
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  clearMocks: true,
  resetMocks: true,
  setupFiles: ['../node_modules/react-native-gesture-handler/jestSetup.js'],
};
