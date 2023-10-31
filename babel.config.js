module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript'
  ],
  // plugins: [
  //   [
  //     'module:react-native-dotenv',
  //    Replaced by the types/env.d.ts file that declares the .env as an @env module
  //     {
  //       moduleName: '@env',
  //       path: '.env',
  //     },
  //   ],
  // ],
};
