'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config');

const EXAMPLE_TXT_PATH = path.resolve(__dirname, './example.txt');

let exampleTxtContent;

beforeAll(() => {
  exampleTxtContent = fs.readFileSync(EXAMPLE_TXT_PATH);
});

afterAll(() => {
  fs.writeFileSync(EXAMPLE_TXT_PATH, exampleTxtContent);
});

it('invalidates webpack build upon changing an inline imported file', () =>
  new Promise((resolve, reject) => {
    const compiler = webpack(config);
    let initialBuild = true;
    const watcher = compiler.watch({}, (error, stats) => {
      if (error || stats.hasErrors()) {
        reject(error || stats.toJson().errors);
        return;
      }
      if (initialBuild) {
        // Modify example.txt to trigger another build
        fs.appendFileSync(EXAMPLE_TXT_PATH, 'foo\n');
        initialBuild = false;
        return;
      }
      // Modified example.txt triggered another build
      watcher.close(() => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
    });
  }));
