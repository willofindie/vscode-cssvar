# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]
### Added
- Support both Changelogs and Release notes.
- Custom script to log changelogs using `git-log` between tags.


## [2.2.0] - 2022-08-28
### Addded
- Support for Hover details for CSS variable source.
- Enable Intellisense for all supported extensions by default, no config needed.

### Chore
- Add support for type-checking before publishing a release.
- Add support for type-checking for `git-push` hooks.


## [2.1.0] - 2022-08-09
### Fixed
- Add backwards compatibility for `cssvar.postcssSyntax` setting.


## [2.0.0] - 2022-08-09
### Breaking Change:
- Support all compatible PostCSS syntax parsers
  - This requires users to update their `settings.json` file for property `cssvar.postcssSyntax`
  - Setting `cssvar.postcssSyntax` excepts a key-value object now.
  - Details can be read in [Customization Doc](https://github.com/willofindie/vscode-cssvar/blob/main/docs/customize-extension.md)

### Addded
- In-built support for `scss`/`css` safe parsers and `less` parser.
- Support parsing `js`, `ts`, `jsx` and `tsx` template literals.
  - Provides CSS variable intellisense from source files with `styled-components`.
- Improved docs
### Fixed
- Ignore some of the improper template literals while parsing JS source files.


## [1.8.1] - 2022-08-06
- Better docs

## [1.8.0] - 2022-08-01
### Addded
- Support evaluating `@media` queries
- Improve usage example.


## [1.7.1] - 2022-07-27
### Added
- Improved test cases

### Fixed
- Default settings getting overriden


## [1.7.0] - 2022-07-24
### Addded
- Support Safe parser to not fail while parsing any type of file.
  - This adds support for parsing any source file added by mistake or on purpose.

## [1.6.0] - 2022-07-24
### Addded
- Support for `ignore` file paths.
- Updated documentation.


## [1.5.0] - 2022-07-21
### Addded
- [#32](https://github.com/willofindie/vscode-cssvar/issues/32) Multi Root workspaces support.
- Usage examples
- Doc on how to [debug extension](https://github.com/willofindie/vscode-cssvar/blob/main/docs/debug-extension.md)

### Fixed
- Properly support VSCode v1.46+


## [1.4.0] - 2022-03-29
### Fixed
- [#28](https://github.com/willofindie/vscode-cssvar/issues/28) Colors definition stopped working post CSS lvl4 spec support

## [1.3.0] - 2022-03-23
### Addded
- Support for recursive/nested color parsing, to provide color details for nested variables.

## [1.2.0] - 2022-03-12
### Fixed
- [#22](https://github.com/willofindie/vscode-cssvar/issues/22) CSS Level 4 Color parsing error.


## [1.1.0] - 2022-03-06
### Addded
- Support for [PostCSS](https://github.com/postcss/postcss) plugins/syntax parsers.
- Evaluate `@imports` urls inside css files.
  - Limited support for css import for local or `node_modules` files.
- Improved documentation
- add css import test cases  - fix:  - fix: documentation

### Fixed
- Nested CSS url paths.


## [1.0.0] - 2022-02-12
### Addded
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
