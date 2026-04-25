module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['module-resolver', {
        resolve: {
          extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.ts', '.tsx'],
          alias: {
            '@fortawesome/react-native-fontawesome': '@fortawesome/react-native-fontawesome'
          }
        }
      }],
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
      }
      ],
    ],
  };
};
