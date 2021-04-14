/**
 * Babel is used specifically to write tests in JS and
 * support Typescript in jest UTs.
 *
 * Jest Test cases should be isolated and if used for
 * VSCode extension specific tests, then it should
 * mock `vscode` module, for jest to ework
 */

module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
