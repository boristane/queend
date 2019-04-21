module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jquery: true,
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'no-mixed-operators': [
      'error',
      {
        groups: [
          ['&', '|', '^', '~', '<<', '>>', '>>>'],
          ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
          ['&&', '||'],
          ['in', 'instanceof'],
        ],
        allowSamePrecedence: true,
      },
    ],
  },
};
