const { override, addBabelPlugin } = require('customize-cra');

module.exports = override(
  addBabelPlugin([
    'babel-plugin-styled-components',
    {
      displayName: true, // You can set this to false for smaller production bundles
      ssr: false,
    },
  ]),
);