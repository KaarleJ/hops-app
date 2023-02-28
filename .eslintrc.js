module.exports=
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "plugins": ["@typescript-eslint", "jest"],
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/semi": [2],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "no-case-declarations": "off",
    "indent": ["error", 2, { "SwitchCase": 1}],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "eqeqeq": "error",
    "no-trailing-spaces": "error",
    "object-curly-spacing": ["error", "always"],
    "arrow-spacing": ["error", { before: true, after: true }]
    
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}