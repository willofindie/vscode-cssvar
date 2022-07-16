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

- [Provides Auto Completion](#working-example) for CSS Variables across VSCode workspaces.
- Supports CSS, SASS, JS, TS etc. Find complete list in [Supported Extensions](#supported-extensions).
- [Color swatch](#show-variable-colors) attached to each usage of `var(--color-variable)`.
- [Goto Definition for CSS Variables](#supports-goto-definitions).
- [Customization](./customize-extension.md)
  - If your project uses **SASS/LESS**, and you are facing issues to setup this extension, please
    read [Customization](./customize-extension.md) Doc.
- [Theme Support](./theming.md)
- _CSS Level 4 color spec support is limited_, to keep the bundle size small
  - Except `color()` api, every other CSS color is supported. Please find
    details for CSS colors [here in MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)

## Supported Configs:

This Extension supports the following properties as of now:

- `cssvar.files`: Array of Strings: `string[]`

  - Should contain relative/absolute path from your workspace root folder.
  - Supports [glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) patterns.
  - Only keep the `files` that have CSS Variables; this will boost the performance.

- `cssvar.extensions`: Array of String: `string[]`

### Supported Extensions:

```ts
"css" |
  "scss" |
  "sass" |
  "less" |
  "postcss" |
  "vue" |
  "svelte" |
  "astro" |
  "ts" |
  "tsx" |
  "jsx" |
  "js";
```

> NOTE: [Open issue](https://github.com/willofindie/vscode-cssvar/issues/new) to add more extension support.

- `cssvar.themes`: Array of String: `string[]`
  - Eg: `cssvar.themes: ["dark"]`. This will help the extension
    distinguish between similarly named variables.
- `cssvar.excludeThemedVariables`: `boolean`
- `cssvar.disableSort`: `boolean`
  - Disables VSCode's default sorting functionality for this extension.
- `cssvar.enableColors`: `boolean`
  - Enable CSS Variable color display everywhere.
  - If this config is changed, reload VSCode window.
- `cssvar.enableGotoDef`: `boolean`
  - Enable VScode's Goto Definition feature for CSS Variables
  - If this config is changed, reload VSCode window.
- `cssvar.postcssPlugins`: `string[]`
  - Details for this can be read here: [Customize Extension](./customize-extension.md)
- `cssvar.postcssSyntax`: `string[]`
  - Details for this can be read here: [Customize Extension](./customize-extension.md)

Following are defaults, which you can override in
your User `settings.json` or Workspace `settings.json`.

- `cssvar.files`: `["index.css"]`
- `cssvar.extensions`: `["css", "scss", "sass", "less"]`
- `cssvar.themes`: `[]`
- `cssvar.excludeThemedVariables`: `false`
- `cssvar.disableSort`: `false`
- `cssvar.enableColors`: `true`
- `cssvar.enableGotoDef`: `true`
- `cssvar.postcssPlugins`: `[]`
- `cssvar.postcssSyntax`: `[]`

## Screeshots:

### How to Install

![How to install](https://user-images.githubusercontent.com/11786283/113474149-bdc37380-948b-11eb-847d-4c031912b9f4.gif)

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
