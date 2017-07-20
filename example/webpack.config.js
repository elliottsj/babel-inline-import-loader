'use strict';

module.exports = {
  context: __dirname,
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          require.resolve('..'),
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                [
                  'inline-import',
                  {
                    extensions: ['.txt'],
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
};
