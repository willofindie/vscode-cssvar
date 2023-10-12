<div align="center">
  <img
  src="https://user-images.githubusercontent.com/11786283/113474026-dd0dd100-948a-11eb-8140-4570d7c983d3.png"
  height="150"
  alt="CssVar Icon" />
</div>


<h1 align="center">
  CSS Variables
</h1>

<div align="center">
  <p align="center">
    <i><b>Please vote/rate and star this project to show your support.</b></i>
    ❤️
  </p>

  <a href="https://github.com/willofindie/vscode-cssvar">
    <img src="https://img.shields.io/github/stars/willofindie/vscode-cssvar?style=social" />
  </a>
  <!-- &nbsp;&nbsp;
  <img src="https://img.shields.io/badge/size-%3C%20200KB-blue?style=flat" /> -->
  &nbsp;&nbsp;
  <a href="https://marketplace.visualstudio.com/items?itemName=phoenisx.cssvar">
    <img src="https://img.shields.io/visual-studio-marketplace/i/phoenisx.cssvar?label=vsc%20installs" />
  </a>
  &nbsp;&nbsp;
  <a href="https://open-vsx.org/extension/phoenisx/cssvar">
    <img src="https://img.shields.io/open-vsx/dt/phoenisx/cssvar?color=yellowgreen&label=ovsx%20installs" />
  </a>
  <br />
  <a href="https://marketplace.visualstudio.com/items?itemName=phoenisx.cssvar&ssr=false#review-details">
    <img src="https://img.shields.io/visual-studio-marketplace/r/phoenisx.cssvar?label=vsc%20rating" />
  </a>
  &nbsp;&nbsp;
  <a href="https://open-vsx.org/extension/phoenisx/cssvar/reviews">
    <img src="https://img.shields.io/open-vsx/rating/phoenisx/cssvar?color=yellowgreen&label=ovsx%20rating" />
  </a>
</div>

## 💡 Features:

This extension helps provide autocompletion IntelliSense
for globally shared CSS Variables and more.

### How the extension works:
- When adding a new CSS declaration property value, press `--`.
- This opens a completion list dropdown, with all the CSS variables in the list.
- Select and add the variable of your choice, to autocomplete.

<br>

### Auto Completion, Color swatches, Goto Definition

This extension has in-built support for parsing: `css`, `scss`, `less`, `js`, `jsx`, `ts`, `tsx`
source file extensions and providing CSS variable suggestions from them.

Details can be read in [Customization Doc][customize-extension-link].


<p>
  <img
    alt="Autocomplete, Color Swatches"
    src="https://user-images.githubusercontent.com/11786283/183150980-15b8b464-566f-49fa-a842-9c50615ab2e9.gif"
    width="49%"
  />
  <img
    alt="Variables Goto Definition"
    src="https://user-images.githubusercontent.com/11786283/183150992-8d83ea67-518b-42ae-a856-e28a0336ff2c.gif"
    width="49%"
  />
</p>

<br/>

### Customization

If your project uses `sass` or `styl` or some other custom source file extension, and you are
facing issues to setup this VSCode extension, please read
[Customization][customize-extension-link] Doc.

<br/>

### Theme Support

Read more about [Theming here][theme-link]

<p>
  <img
    alt="Theming"
    src="https://user-images.githubusercontent.com/11786283/183304293-c665e051-cd51-4cd8-bc88-1ff5a150fcee.gif"
    width="49%"
  />
  <img
    alt="Exclude Duplicates"
    src="https://user-images.githubusercontent.com/11786283/183304299-6fab3d53-46fc-4cf1-91b0-9b0f69ea0d03.gif"
    width="49%"
  />
</p>

<br/>

### CSS Level 4 color spec support

Limited support to keep bundle size small.
<br/>
Except for `color()` api, every other CSS color is supported.
Please find details for CSS colors [here in MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)

<br>

## 🔖 Appendix:

- [Extension setting details][settings-link]
- [Extension Customization][customize-extension-link]
- [Theming Support][theme-link]
- [Debugging the extension][debug-link]

<br><br><br><br>

<!-- <h3 align="center">Phoenisx Sponsors</h3>

<p align="center">
  <a href="./img/sponsors.png">
    <img src='./img/sponsors.png'/>
  </a>
</p> -->




[settings-link]: ./feature-contributions.md
[customize-extension-link]: ./docs/customize-extension.md
[theme-link]: ./docs/theming.md
[debug-link]: ./docs/debug-extension.md
