# babel-inline-import-loader

[![npm version](https://img.shields.io/npm/v/babel-inline-import-loader.svg)](https://www.npmjs.com/package/babel-inline-import-loader)
[![Travis CI Build Status](https://travis-ci.org/elliottsj/combine-loader.svg?branch=master)](https://travis-ci.org/elliottsj/combine-loader)
[![Greenkeeper badge](https://badges.greenkeeper.io/elliottsj/babel-inline-import-loader.svg)](https://greenkeeper.io/)

A webpack loader enabling files imported by [babel-plugin-inline-import](https://github.com/quadric/babel-plugin-inline-import) to trigger rebuilds when content changes.

### Installation

First install [babel-plugin-inline-import@3.0.0](https://github.com/quadric/babel-plugin-inline-import) or later. Then:

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
  webpack: (config, { defaultLoaders, dir }) => {
    const rulesExceptBabelLoaderRule = config.module.rules.filter(
      rule => rule.use !== defaultLoaders.babel
    );

    config.module.rules = [
      ...rulesExceptBabelLoaderRule,
      {
        test: /\.(js|jsx)$/,
        include: [dir],
        exclude: /node_modules/,
        use: [
          'babel-inline-import-loader',
          {
            ...defaultLoaders.babel,
            options: {
              ...defaultLoaders.babel.options,
              // Disable cacheDirectory so that Babel
              // always rebuilds dependent modules
              cacheDirectory: false
            }
          }
        ]
      }
    ];
    return config;
  }
};
```

### Example

Run `npm start` and open http://localhost:8080/. Edit [example.txt](example/example.txt) and webpack should rebuild and reload the page automatically.

### How does it work?

babel-inline-import-loader depends on [babel-plugin-inline-import#10](https://github.com/Quadric/babel-plugin-inline-import/pull/10), so that a comment block specifying the original module path is included next to the inlined import. For example,

```js
import example from './example.txt';
```
is compiled to
```js
/* babel-plugin-inline-import './example.txt' */const example = 'hello world';
```

babel-inline-import-loader then parses the value `'./example.txt'` from the comment and includes that file in webpack's dependency graph via [`this.addDependency`](https://webpack.js.org/api/loaders/#this-adddependency).
