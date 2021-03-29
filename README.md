# CSSVar (A VSCode Extension)

<div align="center">
  <img
  src="https://user-images.githubusercontent.com/11786283/112741125-357f3300-8fa0-11eb-8740-41221488509c.png"
  height="150"
  alt="CssVar Icon" />
  <img
  src="https://user-images.githubusercontent.com/11786283/112747300-16999480-8fd2-11eb-9f21-41a77abb332c.png"
  height="150"
  alt="CssVar Icon" />
</div>

This extension helps to autocomplete globally shared CSS
Variables.
> Only those variables that are present in files,
provided in Extension `files` config, will be considered as global.

## Supported Configs:

This Extension supports the following properties as of now:

- `cssvar.files`: Array of Strings: `string[]`
- `cssvar.extensions`: Array of String: `string[]`
- `cssvar.themes`: Array of String: `string[]`
  - Eg: `cssvar.themes: ["dark"]`. This will help the extension
    distinguish between similarly named variables.
- `cssvar.excludeThemedVariables`: `boolean`

*`cssvar.files` should contain relative/absolute path from
your workspace root folder.*

Following are defaults, which you can override in
your User `settings.json` or Workspace `settings.json`.

- `cssvar.files`: `["index.css"]`
- `cssvar.extensions`: `["css", "scss", "sass", "less"]`
- `cssvar.themes`: `[]`
- `cssvar.excludeThemedVariables`: `false`

## Screeshots:

### How to Install
![How to install](https://user-images.githubusercontent.com/11786283/112744615-48edc680-8fbf-11eb-870c-91b03a4310bb.gif)


### Working Example
![Working Example](https://user-images.githubusercontent.com/11786283/112746381-07174d00-8fcc-11eb-82eb-d9b27540a956.gif)

### Theming Support:
![Theming](https://user-images.githubusercontent.com/11786283/112832552-1ae9ae80-90b3-11eb-8505-9fef822e5709.gif)

![Exclude Themed Variables](https://user-images.githubusercontent.com/11786283/112832562-2046f900-90b3-11eb-93df-3d94deb1c9f6.gif)

## Supported Features:

* Show Auto Completion dialogue on trigger chars: `--`
* Show Color Values and Colors in Autocomplete popup.
* Minimal support for CSS Modules, using postcss.
  * This is to make sure, the extension doesn't breaks on
    CSS Module Files.
* Themed CSS Variable support.

## Issues:

- SASS/LESS variables, or any specific CSS extension language feature.
  - For eg. setting CSS variable to a SASS Variable will work, but will not
    be considered as a CSS color.
  - Workaround
    - Create a separate CSS compatible SASS/LESS (variables) file.
    - Remove SASS One line Comments. Use proper CSS block comments.
