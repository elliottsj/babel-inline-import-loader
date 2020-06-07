'use strict';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const path = require('path');

module.exports = function (content) {
  const ast = parser.parse(content, {
    sourceType: 'module',
  });
  traverse(ast, {
    enter: (astPath) => {
      const node = astPath.node;
      if (!t.isVariableDeclaration(node)) {
        return;
      }
      if (!node.leadingComments) {
        return;
      }
      if (node.leadingComments.length === 0) {
        return;
      }

      // `node` is a variable declaration which was transpiled from an import statement.
      // Any leading comments which start with ' babel-plugin-inline-import ' were inserted by
      // babel-plugin-inline-import, e.g.
      //
      //   /* babel-plugin-inline-import './example.txt' */ const example = 'hello world';
      //
      // Extract the path embedded in the comment (e.g. './example.txt' above) and add it as a
      // webpack dependency.
      node.leadingComments
        .filter(
          (leadingComment) =>
            leadingComment.type === 'CommentBlock' &&
            leadingComment.value.startsWith(' babel-plugin-inline-import ')
        )
        .forEach((leadingComment) => {
          const modulePath = leadingComment.value.match(/'(.*)'/)[1];
          const absolutePath = path.resolve(
            path.dirname(this.resourcePath),
            modulePath
          );
          this.addDependency(absolutePath);
        });
    },
  });
  return content;
};
