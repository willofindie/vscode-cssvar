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
    :heart:
  </p>

  <a href="https://github.com/willofindie/vscode-cssvar">
    <img src="https://img.shields.io/github/stars/willofindie/vscode-cssvar?style=social" />
  </a>
  &nbsp;&nbsp;
  <img src="https://img.shields.io/badge/size-%3C%20200KB-blue?style=flat" />
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

## :bulb: Features:

This extension helps provide autocompletion IntelliSense
for globally shared CSS Variables and more.

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

If you are still seeing duplicates, disable [VSCode's IntelliSense for variable suggestions](https://code.visualstudio.com/docs/getstarted/settings#_default-settings).

```jsonc
{
  "[css]" : {
    "editor.suggest.showVariables": false
  },
  "[scss]" : {
    "editor.suggest.showVariables": false
  },
}
```

<br/>

### CSS Level 4 color spec support

Limited support to keep bundle size small.
<br/>Except `color()` api, every other CSS color is supported.
Please find details for CSS colors [here in MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)

<br/><br/>

## :hammer_and_wrench: Supported Configs:

This Extension supports the following properties as of now:


<table>
<thead>
  <tr align="left">
    <th><b>Setting</b></th>
    <th><b>Description</b></th>
    <th><b>Type</b></th>
    <th><b>Default</b></th>
  </tr>
</thead>
<tbody>
  <tr align="left">
    <td><code>cssvar.files</code></td>
    <td>
      Relative/Absolute paths to CSS variable source files
    </td>
    <td><code>string[]</code></td>
    <td><br>
      <pre lang="js">["**/*.css"]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.ignore</code></td>
    <td>
      Relative/Absolute paths to file/folder sources to be ignored
    </td>
    <td><code>string[]</code></td>
    <td><br>
      <pre lang="js">["**/node_modules/**"]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.extensions</code></td>
    <td>File extensions in which IntelliSense will be enabled</td>
    <td><code>string[]</code></td>
    <td>
      <br>
      <pre lang="js">[
  "css",
  "scss",
  "sass",
  "less",
  "postcss",
  "vue",
  "svelte",
  "astro"
]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.themes</code>
      <br>Helps to bucket CSS variables based on themes used in any project
    </td>
    <td>
      <br>CSS Theme classnames used in source files
      <br>E.g.<pre lang="js">["dark","dim"]</pre>
    </td>
    <td><code>string[]</code></td>
    <td>
      <br>
      <pre lang="js">[]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.excludeThemedVariables</code>
      <br>If <code>true</code>, hides duplicate theme variables from the list
    </td>
    <td>Exclude themed variables to remove unnecessary duplicates</td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">false</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.disableSort</code>
      <br>Intellisense list won't be sorted
    </td>
    <td>Disables default sorting applied by VSCode</td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">false</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.enableColors</code></td>
    <td>Enable VScode's Color Representation feature when <code>true</code></td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">true</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td><code>cssvar.enableGotoDef</code></td>
    <td>Enable VScode's Goto Definition feature for CSS Variable</td>
    <td><code>boolean</code></td>
    <td>
      <br>
      <pre lang="js">true</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.postcssPlugins</code>
      <br>Details for this can be read here: <a href="./docs/customize-extension.md">Customize Extension</a>
    </td>
    <td>
      <br>Provide PostCSS Plugins to support custom CSS features
      <br>E.g.<pre lang="js">["postcss-nested"]</pre>
    </td>
    <td><code>string[]</code></td>
    <td>
      <br>
      <pre lang="js">[]</pre>
      <br>
    </td>
  </tr>
  <tr align="left">
    <td>
      <code>cssvar.postcssSyntax</code>
      <br>Details for this can be read here: <a href="./docs/customize-extension.md">Customize Extension</a>
    </td>
    <td>
      <br>Provides custom syntax parser
      <br>E.g.<pre lang="js">["postcss-scss"]</pre>
    </td>
    <td><code>string[]</code></td>
    <td>
      <br>
      <pre lang="js">[]</pre>
      <br>
    </td>
  </tr>
</tbody>
</table>
<br/><br/>

> NOTE: Please [raise an issue](https://github.com/willofindie/vscode-cssvar/issues/new) for any feature request or a bug fix.

[customize-extension-link]: ./docs/customize-extension.md
[theme-link]: ./docs/theming.md
