module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        extensions: [
          '.native.js',
          '.native.jsx',
          '.native.ts',
          '.native.tsx',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.ios.js',
          '.ios.jsx',
          '.ios.ts',
          '.ios.tsx',
          '.android.js',
          '.android.jsx',
          '.android.ts',
          '.android.tx',
        ],
        alias: {
          '@assets': './assets',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@libs': './src/libs',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@styles': './src/styles',
          '@src': './src',
        },
      },
    ],
  ],
};