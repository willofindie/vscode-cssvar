# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0](https://github.com/willofindie/vscode-cssvar/compare/v2.4.1...v2.5.0) - 2022-11-06
### Features
- [#72](https://github.com/willofindie/vscode-cssvar/issues/72) Enable all useful language ids to dynamically enable CSS Variable IntelliSense
  - Update Readme doc
  - Conditionaly enable diagnostics
  - Add `cssvar.enable` setting to enable/disable the extension
- [#78](https://github.com/willofindie/vscode-cssvar/issues/78) Add support for `tokencss`
  - Adds custom plugin resolver
- Update examples
- Add `config` tests

### Fixes
- [#95](https://github.com/willofindie/vscode-cssvar/issues/95) Handle variable recursive evaluation
- [#58](https://github.com/willofindie/vscode-cssvar/issues/58) Improve config contributions to make it compatible with VSCode's Settings UI.
- Unit Tests
- [#87](https://github.com/willofindie/vscode-cssvar/issues/87) Handle hover errors for undeclared css vars


## [2.4.1](https://github.com/willofindie/vscode-cssvar/compare/v2.4.0...v2.4.1) - 2022-10-21
### Fixes
- Reverts: [#74](https://github.com/willofindie/vscode-cssvar/issues/74) Support for .gitignore
  - Fixes broken `cssvar.ignore` config.


## [2.4.0](https://github.com/willofindie/vscode-cssvar/compare/v2.3.0...v2.4.0) - 2022-10-16
### Features
- [#74](https://github.com/willofindie/vscode-cssvar/issues/74) Add `.gitignore` support
- [#61](https://github.com/willofindie/vscode-cssvar/issues/61) Add suport for plugin options
### Doc
-  fix typo
-  update extension settings doc


## [2.3.0](https://github.com/willofindie/vscode-cssvar/compare/v2.2.2...v2.3.0) - 2022-09-20
### Features
- [#73](https://github.com/willofindie/vscode-cssvar/issues/73) Add support for linting
  - New setting added to this extension: `cssvar.mode` (similar syntax to eslint `rules` property)
  - Set extension `mode` to `warn` or `error` to enable this new feature.
-  Add test cases for diagnostics

### Fixed
-  Fixes definition and color providers with variable functions using spaces in between parenthesis.
-  Minor fixes to debug logs.
-  Fixes unit tests.


### Doc
-  Add emojis to readme accepteable on Marketplace doc as well.
-  Segregate docs into sections, which can be read separately.


## [2.2.2](https://github.com/willofindie/vscode-cssvar/compare/v2.2.1...v2.2.2) - 2022-09-15
### Features
- [#63](https://github.com/willofindie/vscode-cssvar/issues/63) Add support to fetch remote http file content
  - Remote file present in CSS `@import` or in extension setting will be fetched.
- Add sponsors to Readme
### Fixed
- Definition Provider for url imports
- Test cases

## [2.2.1](https://github.com/willofindie/vscode-cssvar/compare/v2.2.0...v2.2.1) - 2022-09-05
### Features
- [#65](https://github.com/willofindie/vscode-cssvar/issues/65) Dedupe CSS variables per file.
- Evaluate less used css at-rules like `@supports`
- Evaluate @forward scss import rules
- Add script to dual publish extension to vsce & ovsx
- [#37](https://github.com/willofindie/vscode-cssvar/issues/37) add support for evaluating scss mixins
- Support both Changelogs and Release notes.
- Custom script to log changelogs using `git-log` between tags.

### Fixed
- cache invalidations
- examples | remove old example code


## [2.2.0](https://github.com/willofindie/vscode-cssvar/compare/v2.1.0...v2.2.0) - 2022-08-28
### Features
- Support for Hover details for CSS variable source.
- Enable Intellisense for all supported extensions by default, no config needed.

### Chore
- Add support for type-checking before publishing a release.
- Add support for type-checking for `git-push` hooks.


## [2.1.0](https://github.com/willofindie/vscode-cssvar/compare/v2.0.0...v2.1.0) - 2022-08-09
### Fixed
- Add backwards compatibility for `cssvar.postcssSyntax` setting.


## [2.0.0](https://github.com/willofindie/vscode-cssvar/compare/v1.8.1...v2.0.0) - 2022-08-09
### ⚠️&nbsp; Breaking Change:
- Support all compatible PostCSS syntax parsers
  - This requires users to update their `settings.json` file for property `cssvar.postcssSyntax`
  - Setting `cssvar.postcssSyntax` accepts a key-value object now.
    - Details can be read in [Customization Doc](https://github.com/willofindie/vscode-cssvar/blob/main/docs/customize-extension.md)

### Features
- In-built support for `scss`/`css` safe parsers and `less` parser.
- Support parsing `js`, `ts`, `jsx` and `tsx` template literals.
  - Provides CSS variable intellisense from source files with `styled-components`.
- Improved docs
### Fixed
- Ignore some of the improper template literals while parsing JS source files.


## [1.8.1](https://github.com/willofindie/vscode-cssvar/compare/v1.8.0...v1.8.1) - 2022-08-06
- Better docs

## [1.8.0](https://github.com/willofindie/vscode-cssvar/compare/v1.7.1...v1.8.0) - 2022-08-01
### Features
- Support evaluating `@media` queries
- Improve usage example.


## [1.7.1](https://github.com/willofindie/vscode-cssvar/compare/v1.7.0...v1.7.1) - 2022-07-27
### Added
- Improved test cases

### Fixed
- Default settings getting overriden


## [1.7.0](https://github.com/willofindie/vscode-cssvar/compare/v1.6.0...v1.7.0) - 2022-07-24
### Features
- Support Safe parser to not fail while parsing any type of file.
  - This adds support for parsing any source file added by mistake or on purpose.

## [1.6.0](https://github.com/willofindie/vscode-cssvar/compare/v1.5.0...v1.6.0) - 2022-07-24
### Features
- Support for `ignore` file paths.
- Updated documentation.


## [1.5.0](https://github.com/willofindie/vscode-cssvar/compare/v1.4.0...v1.5.0) - 2022-07-21
### Features
- [#32](https://github.com/willofindie/vscode-cssvar/issues/32) Multi Root workspaces support.
- Usage examples
- Doc on how to [debug extension](https://github.com/willofindie/vscode-cssvar/blob/main/docs/debug-extension.md)

### Fixed
- Properly support VSCode v1.46+


## [1.4.0](https://github.com/willofindie/vscode-cssvar/compare/v1.3.0...v1.4.0) - 2022-03-29
### Fixed
- [#28](https://github.com/willofindie/vscode-cssvar/issues/28) Colors definition stopped working post CSS lvl4 spec support

## [1.3.0](https://github.com/willofindie/vscode-cssvar/compare/v1.2.0...v1.3.0) - 2022-03-23
### Features
- Support for recursive/nested color parsing, to provide color details for nested variables.

## [1.2.0](https://github.com/willofindie/vscode-cssvar/compare/v1.1.0...v1.2.0) - 2022-03-12
### Fixed
- [#22](https://github.com/willofindie/vscode-cssvar/issues/22) CSS Level 4 Color parsing error.


## [1.1.0](https://github.com/willofindie/vscode-cssvar/compare/v1.0.0...v1.1.0) - 2022-03-06
### Features
- Support for [PostCSS](https://github.com/postcss/postcss) plugins/syntax parsers.
- Evaluate `@imports` urls inside css files.
  - Limited support for css import for local or `node_modules` files.
- Improved documentation
- add css import test cases  - fix:  - fix: documentation

### Fixed
- Nested CSS url paths.


## [1.0.0](https://github.com/willofindie/vscode-cssvar/compare/ad660e...v1.0.0) - 2022-02-12
### Features
- Support CSS variable autocompletion intellisense.
- Support Goto Definitions for CSS Variables
- Support VSCode color info.
  - Support for toggling on/off Color definitions.
- Support for disabling default VSCode sorting using settings
- Support for caching parsed CSS variables.
- Support CSS Themed Variables
- Show file paths which failed to get parsed
- Add Unit Tests
- [#4](https://github.com/willofindie/vscode-cssvar/issues/4) Support glob pattern for filename
- [#3](https://github.com/willofindie/vscode-cssvar/issues/3) Support short extension names
- Project setup

### Fixed
- Duplicate CSS variable definitions in the same file.
- [#17](https://github.com/willofindie/vscode-cssvar/issues/17) Support `svelte`|`vue` file extensions
- [#11](https://github.com/willofindie/vscode-cssvar/issues/11) Improve regex restrictions for intellisense triggers
