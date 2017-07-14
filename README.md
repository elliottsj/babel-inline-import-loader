# babel-inline-import-loader

[![npm version](https://img.shields.io/npm/v/babel-inline-import-loader.svg)](https://www.npmjs.com/package/babel-inline-import-loader)

A webpack loader enabling files imported by [babel-plugin-inline-import](https://github.com/quadric/babel-plugin-inline-import) to trigger rebuilds when content changes.

### Installation

First install [babel-plugin-inline-import](https://github.com/quadric/babel-plugin-inline-import). Then:

```shell
npm install babel-inline-import-loader --save-dev
```

### Usage

In your webpack config, put `'babel-inline-import-loader'` before `'babel-loader'`:

```js
// webpack.config.js

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-inline-import-loader',
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                ['inline-import', {
                  extensions: ['.txt']
                }]
              ],
              // Make sure cacheDirectory is disabled so that Babel
              // always rebuilds dependent modules
              cacheDirectory: false // default
            }
          }
        ]
    ]
  }
};
```

#### Next.js

In [Next.js](https://github.com/zeit/next.js), add the following to your `next.config.js`:

```js
module.exports = {
  // ...
  webpack: config => {
    // The main 'babel-loader' rule is the last rule in the array as of next@2.4.7
    // This may change in future versions
    const rulesExceptBabelLoaderRule = config.module.rules.slice(0, -1);
    const babelLoaderRule = config.module.rules.slice(-1)[0];

    const newConfig = Object.assign({}, config, {
      module: Object.assign({}, config.module, {
        rules: [
          ...rulesExceptBabelLoaderRule,
          {
            test: babelLoaderRule.test,
            include: babelLoaderRule.include,
            exclude: babelLoaderRule.exclude,
            use: [
              'babel-inline-import-loader',
              {
                loader: 'babel-loader',
                options: Object.assign({}, babelLoaderRule.options, {
                  // Disable cacheDirectory so that Babel
                  // always rebuilds dependent modules
                  cacheDirectory: false,
                }),
              },
            ],
          },
        ],
      }),
    });
    return newConfig;
  },
};
```

### Example

Run `npm start` and open http://localhost:8080/. Edit [example.txt](example/example.txt) and webpack should rebuild and reload the page automatically.

### How does it work?

babel-inline-import-loader depends on [babel-plugin-inline-import#9999](https://github.com/Quadric/babel-plugin-inline-import/pull/9999), so that a comment block specifying the original module path is included next to the inlined import. For example,

```js
import example from './example.txt';
```
is compiled to
```js
/* babel-plugin-inline-import './example.txt' */const example = 'hello world';
```

babel-inline-import-loader then parses the value `'./example.txt'` from the comment and includes that file in webpack's dependency graph via [`this.addDependency`](https://webpack.js.org/api/loaders/#this-adddependency).
