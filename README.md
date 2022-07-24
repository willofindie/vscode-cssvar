<div align="center">
  <img
  src="https://user-images.githubusercontent.com/11786283/113474026-dd0dd100-948a-11eb-8140-4570d7c983d3.png"
  height="150"
  alt="CssVar Icon" />
  <img
  src="https://user-images.githubusercontent.com/11786283/112747300-16999480-8fd2-11eb-9f21-41a77abb332c.png"
  height="150"
  alt="CssVar Icon" />
</div>

![CSS Extension Support](https://user-images.githubusercontent.com/11786283/153740157-96e5033c-2fed-4475-9844-1eb4e866ecfd.png)

<p align="center">
  <img src="https://img.shields.io/badge/size-%3C%20200KB-blue?style=flat" />
</p>


<h1 align="center">CSS Variables</h1>

## Features:

[Read how to Customize Extension](./customize-extension.md)

This extension helps to autocomplete globally shared CSS Variables and a lot more.

* [Provides Auto Completion](#working-example) for CSS Variables across VSCode workspaces.
* Supports CSS, SASS, JS, TS etc. Find complete list in [Supported Extensions](#supported-extensions).
* [Color swatch](#show-variable-colors) attached to each usage of `var(--color-variable)`.
* [Goto Definition for CSS Variables](#supports-goto-definitions).
* [Customization](./customize-extension.md)
  * If your project uses **SASS/LESS**, and you are facing issues to setup this extension, please
    read [Customization](./customize-extension.md) Doc.
* [Theme Support](./theming.md)
* *CSS Level 4 color spec support is limited*, to keep the bundle size small
  * Except `color()` api, every other CSS color is supported. Please find
    details for CSS colors [here in MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)

## Supported Configs:

This Extension supports the following properties as of now:


| **Setting**                   | **Description**                                              | **Type** | **Example**                                | **Default**                                             |
|-------------------------------|--------------------------------------------------------------|----------|--------------------------------------------|---------------------------------------------------------|
| `cssvar.files`                  | Relative/Absolute paths to CSS variable file sources      | string[] | ["input.css"]                           | [**/*.css]                                              |                                                                                                                                                                                                                                                            |
| `cssvar.ignore`                  | Relative/Absolute paths to file/folder sources to be ignored      | string[] | ["ignore.css"]                           | [\**/node_modules/**]                                              |                                                                                                                                                                                                                                                            |
| `cssvar.extensions`             | File extensions for which IntelliSense will be enabled    | string[] | [<br>&nbsp;&nbsp;"css",<br>&nbsp;&nbsp;"scss",<br>&nbsp;&nbsp;"jsx"<br>] | [<br>&nbsp;&nbsp;"css",<br>&nbsp;&nbsp;"scss",<br>&nbsp;&nbsp;"tsx",<br>&nbsp;&nbsp;"jsx"<br>]  |
| `cssvar.themes`<br>Helps to bucket CSS variables based on themes used in any project | CSS Theme classnames used in source files                 | string[] | [<br>&nbsp;&nbsp;"dark",<br>&nbsp;&nbsp;"dim"<br>]             | []                                                      |
| `cssvar.excludeThemedVariables`<br>If true, hides duplicate theme variables from the list | Exclude themed variables to remove unnecessary duplicates | boolean  |                                            | false                                                   |
| `cssvar.disableSort`<br>Intellisense list won't be sorted | Disables default sorting applied by VSCode                | boolean  |                                            | false                                                   |
| `cssvar.enableColors`           | Enable VScode's Color Representation feature when true    | boolean  |                                            | true                                                    |
| `cssvar.enableGotoDef`          | Enable VScode's Goto Definition feature for CSS Variable  | boolean  |                                            | true                                                    |
| `cssvar.postcssPlugins`<br>Details for this can be read here: [Customize Extension](./customize-extension.md) | Provide PostCSS Plugins to support custom CSS features    | string[] | ["postcss-nested"]                         | []                                                      |
| `cssvar.postcssSyntax`<br>Details for this can be read here: [Customize Extension](./customize-extension.md) | Provides a list of custom parsers                                       | string[] | ["postcss-scss"]                           | []                                                      |


## Screeshots:

### Working Example
![Working Example](https://user-images.githubusercontent.com/11786283/112746381-07174d00-8fcc-11eb-82eb-d9b27540a956.gif)

### Show Variable Colors
![Var Colors](https://user-images.githubusercontent.com/11786283/153472208-91fc1c43-fa88-41c6-b1f2-4465369634d9.gif)

### Supports Goto Definitions
![Var Goto Definition](https://user-images.githubusercontent.com/11786283/153715008-24f9a0c2-e26d-48c9-9a8c-35152c7279bb.gif)


### Theming Support:
![Theming](https://user-images.githubusercontent.com/11786283/112832552-1ae9ae80-90b3-11eb-8505-9fef822e5709.gif)

![Exclude Themed Variables](https://user-images.githubusercontent.com/11786283/112832562-2046f900-90b3-11eb-93df-3d94deb1c9f6.gif)


> NOTE: Please [raise an issue](https://github.com/willofindie/vscode-cssvar/issues/new) for any feature request or a bug fix.
