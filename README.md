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

`cssvar.files` should contain relative/absolute path from
your workspace root folder.

Following are defaults, which you can override in
your User `settings.json` or Workspace `settings.json`.

- `cssvar.files`: `["index.css"]`
- `cssvar.extensions`: `["css", "scss", "sass", "less"]`

## Screeshots:

### How to Install
![How to install](https://user-images.githubusercontent.com/11786283/112744615-48edc680-8fbf-11eb-870c-91b03a4310bb.gif)


### Working Example
![Working Example](https://user-images.githubusercontent.com/11786283/112746381-07174d00-8fcc-11eb-82eb-d9b27540a956.gif)
)

## Features to Support in future:

- [ ] Show variable values in imported CSS Files, in Editor Line Bar.
  - This will help to get details on CSS Variable being used in different files.
- [ ] Fix: Extension Settings not visible in VSCode.
- [ ] Intelligently add semicolon. Add only if the line does not contain any Semicolon.
- Support SASS?? (Still unsure on this, as SASS/LESS etc. seems overrated now-a-days).

## Issues:

- SASS/LESS variables, or any specific CSS extension language feature.
  - For eg. setting CSS variable to a SASS Variable will work, but will not
    be considered as a CSS color.
  - Workaround: Create a separate CSS compatible SASS/LESS (variables) file.
