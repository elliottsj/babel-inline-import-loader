'use strict';

const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const t = require('babel-types');
const path = require('path');

module.exports = function (content) {
  const ast = babylon.parse(content, {
    sourceType: 'module',
  });
  traverse(ast, {
    enter: ({ node }) => {
      if (!t.isVariableDeclaration(node)) {
        return;
      }
      if (!node.leadingComments) {
        return;
      }
      if (node.leadingComments.length === 0) {
        return;
      }
      if (node.leadingComments[0].type !== 'CommentBlock') {
        return;
      }
      if (!node.leadingComments[0].value.startsWith(' babel-plugin-inline-import ')) {
        return;
      }
      const modulePath = node.leadingComments[0].value.match(/'(.*)'/)[1];
      const absolutePath = path.resolve(path.dirname(this.resourcePath), modulePath);
      this.addDependency(absolutePath);
    }
  });
  return content;
}
